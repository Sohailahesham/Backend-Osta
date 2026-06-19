/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { RoomType, SenderRole } from './schemas/message.schema';
import { UserRole } from 'src/users/schemas/user.schema';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageDocument } from './schemas/message.schema';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: '/chat',
})
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private connectedUsers = new Map<
    string,
    { userId: string; role: UserRole; email: string }
  >();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  // ── Connection ─────────────────────────────────────────────────────────────

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token?.replace('Bearer ', '') ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.emit('error', { message: 'No token provided' });
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      this.connectedUsers.set(client.id, {
        userId: payload.sub,
        role: payload.role,
        email: payload.email,
      });

      console.log(`✅ Connected: ${payload.email} [${payload.role}]`);
    } catch {
      client.emit('error', { message: 'Invalid or expired token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
  }

  // ── 1. Fixed Service Request Chat ─────────────────────────────────────────

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) throw new WsException('Unauthorized');

    try {
      await this.chatService.validateRequestAccess(
        data.requestId,
        user.userId,
        user.role,
      );

      const roomId = `room_${data.requestId}`;
      await client.join(roomId);

      const unreadCount = await this.chatService.getUnreadCount(
        roomId,
        user.userId,
        user.role,
      );
      client.emit('joinedRoom', { roomId, unreadCount });
      client
      .to(roomId)
      .emit('userJoined', { userId: user.userId, role: user.role });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) throw new WsException('Unauthorized');
    if (!data.content?.trim()) {
      client.emit('error', { message: 'Empty message' });
      return;
    }

    try {
      await this.chatService.validateRequestAccess(
        data.requestId,
        user.userId,
        user.role,
      );

      const message = await this.chatService.createRequestMessage(
        data.requestId,
        user.userId,
        user.role,
        data.content.trim(),
      );

      this.broadcastRequestMessage(data.requestId, message, user.userId);
    } catch (error) {
      // لو الـ error من blockContent → بنبعت الـ message للـ client بس
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) throw new WsException('Unauthorized');

    const roomId = `room_${data.requestId}`;
    await this.chatService.markAsRead(roomId, user.userId);
    client.to(roomId).emit('messagesRead', { roomId, readBy: user.userId });
  }

  // ── 2. Custom Request Chat (Post + Proposal) ───────────────────────────────
  //
  // Room ID: `custom_{postId}_{technicianId}`
  // - الـ client يبعت postId + technicianId (عشان يدخل room فني معين)
  // - الـ technician يبعت postId بس (الـ technicianId بتاعه من الـ token)

  @SubscribeMessage('joinCustomRoom')
  async handleJoinCustomRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { postId: string; technicianId?: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) throw new WsException('Unauthorized');

    try {
      // الـ technician → technicianId هو نفسه
      // الـ client → لازم يبعت technicianId عشان يعرف يدخل room مين
      const technicianId =
        user.role === UserRole.TECHNICIAN ? user.userId : data.technicianId;

      if (!technicianId) {
        client.emit('error', {
          message: 'technicianId is required for clients',
        });
        return;
      }

      await this.chatService.validateCustomRequestAccess(
        data.postId,
        technicianId,
        user.userId,
        user.role,
      );

      const roomId = `custom_${data.postId}_${technicianId}`;
      await client.join(roomId);

      const unreadCount = await this.chatService.getUnreadCount(
        roomId,
        user.userId,
        user.role,
      );
      client.emit('joinedCustomRoom', { roomId, unreadCount });
      client
      .to(roomId)
      .emit('userJoined', { userId: user.userId, role: user.role });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('sendCustomMessage')
  async handleSendCustomMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      postId: string;
      technicianId?: string;
      content: string;
    },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) throw new WsException('Unauthorized');
    if (!data.content?.trim()) {
      client.emit('error', { message: 'Empty message' });
      return;
    }

    try {
      const technicianId =
        user.role === UserRole.TECHNICIAN ? user.userId : data.technicianId;

      if (!technicianId) {
        client.emit('error', {
          message: 'technicianId is required for clients',
        });
        return;
      }

      await this.chatService.validateCustomRequestAccess(
        data.postId,
        technicianId,
        user.userId,
        user.role,
      );

      const message = await this.chatService.createCustomRequestMessage(
        data.postId,
        technicianId,
        user.userId,
        user.role,
        data.content.trim(),
      );

      this.broadcastCustomMessage(
        data.postId,
        technicianId,
        message,
        user.userId,
      );
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('markCustomAsRead')
  async handleMarkCustomAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { postId: string; technicianId?: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) throw new WsException('Unauthorized');

    const technicianId =
      user.role === UserRole.TECHNICIAN ? user.userId : data.technicianId;
    if (!technicianId) return;

    const roomId = `custom_${data.postId}_${technicianId}`;
    await this.chatService.markAsRead(roomId, user.userId);
    client.to(roomId).emit('messagesRead', { roomId, readBy: user.userId });
  }

  // ── 3. Community Chat ──────────────────────────────────────────────────────

  @SubscribeMessage('joinCommunity')
  async handleJoinCommunity(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { categoryId: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) throw new WsException('Unauthorized');

    try {
      await this.chatService.validateCommunityAccess(
        data.categoryId,
        user.userId,
        user.role,
      );

      const roomId = `community_${data.categoryId}`;
      await client.join(roomId);

      const history = await this.chatService.getMessages(roomId, 50);
      client.emit('joinedCommunity', { roomId, history });
      client
      .to(roomId)
      .emit('userJoined', { userId: user.userId, role: user.role });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('sendCommunityMessage')
  async handleCommunityMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { categoryId: string; content: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) throw new WsException('Unauthorized');
    if (!data.content?.trim()) {
      client.emit('error', { message: 'Empty message' });
      return;
    }

    try {
      await this.chatService.validateCommunityAccess(
        data.categoryId,
        user.userId,
        user.role,
      );

      const roomId = `community_${data.categoryId}`;
      const message = await this.chatService.saveMessage(
        roomId,
        RoomType.COMMUNITY,
        user.userId,
        SenderRole.TECHNICIAN,
        data.content.trim(),
      );

      this.server.to(roomId).emit('newCommunityMessage', {
        _id: message._id,
        roomId,
        roomType: RoomType.COMMUNITY,
        senderId: user.userId,
        content: message.content,
        createdAt: message.createdAt,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // ── 4. Support Chat ────────────────────────────────────────────────────────

  @SubscribeMessage('joinSupport')
  async handleJoinSupport(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId?: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) throw new WsException('Unauthorized');

    try {
      const targetUserId =
        user.role === UserRole.ADMIN && data.userId ? data.userId : user.userId;

      this.chatService.validateSupportAccess(
        targetUserId,
        user.userId,
        user.role,
      );

      const roomId = `support_${targetUserId}`;
      await client.join(roomId);

      const history = await this.chatService.getMessages(roomId, 50);
      client.emit('joinedSupport', { roomId, history });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('sendSupportMessage')
  async handleSupportMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId?: string; content: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) throw new WsException('Unauthorized');
    if (!data.content?.trim()) {
      client.emit('error', { message: 'Empty message' });
      return;
    }

    try {
      const targetUserId =
        user.role === UserRole.ADMIN && data.targetUserId
          ? data.targetUserId
          : user.userId;

      this.chatService.validateSupportAccess(
        targetUserId,
        user.userId,
        user.role,
      );

      const roomId = `support_${targetUserId}`;
      const senderRole =
        user.role === UserRole.ADMIN
          ? SenderRole.ADMIN
          : user.role === UserRole.CLIENT
          ? SenderRole.CLIENT
          : SenderRole.TECHNICIAN;

      const message = await this.chatService.saveMessage(
        roomId,
        RoomType.SUPPORT,
        user.userId,
        senderRole,
        data.content.trim(),
      );

      this.server.to(roomId).emit('newSupportMessage', {
        _id: message._id,
        roomId,
        roomType: RoomType.SUPPORT,
        senderId: user.userId,
        senderRole,
        content: message.content,
        createdAt: message.createdAt,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // ── Public Methods ─────────────────────────────────────────────────────────

  /** يُستدعى من RequestService لما الـ fixed request يخلص */
  closeRoom(requestId: string) {
    const roomId = `room_${requestId}`;
    this.server.to(roomId).emit('roomClosed', {
      roomId,
      message: 'This request has been completed or cancelled.',
    });
    this.server.in(roomId).socketsLeave(roomId);
  }

  /** يُستدعى لما الـ post يتقبل proposal واحد — بيقفل باقي الـ rooms */
  async closeCustomRooms(
    postId: string,
    acceptedTechnicianId: string,
    rejectedTechnicianIds: string[],
  ) {
    for (const techId of rejectedTechnicianIds) {
      const roomId = `custom_${postId}_${techId}`;
      this.server.to(roomId).emit('customRoomClosed', {
        postId,
        acceptedTechnicianId,
        message: 'The post owner has selected a technician.',
      });
      this.server.in(roomId).socketsLeave(roomId);
    }
  }

  private toRealtimeMessage(
    message: MessageDocument,
    roomId: string,
    senderId: string,
  ) {
    return {
      _id: message._id,
      roomId,
      roomType: message.roomType,
      senderId,
      senderRole: message.senderRole,
      content: message.content,
      imageUrl: message.imageUrl ?? null,
      isRead: false,
      createdAt: message.createdAt,
    };
  }

  broadcastRequestMessage(
    requestId: string,
    message: MessageDocument,
    senderId: string,
  ) {
    const roomId = `room_${requestId}`;
    this.server
    .to(roomId)
    .emit('newMessage', this.toRealtimeMessage(message, roomId, senderId));
  }

  broadcastCustomMessage(
    postId: string,
    technicianId: string,
    message: MessageDocument,
    senderId: string,
  ) {
    const roomId = `custom_${postId}_${technicianId}`;
    this.server
    .to(roomId)
    .emit(
      'newCustomMessage',
      this.toRealtimeMessage(message, roomId, senderId),
    );
  }
}
