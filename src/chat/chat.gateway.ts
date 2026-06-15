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

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  //* map of connected users
  private connectedUsers = new Map<
    string,
    { userId: string; role: UserRole; email: string }
  >();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  // ── Connection ───────────────────────────────────────────────────────────

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

  // ── 1. Request Chat ──────────────────────────────────────────────────────

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
    @MessageBody() data: { requestId: string; content: string },
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

      const roomId = `room_${data.requestId}`;
      const senderRole =
        user.role === UserRole.CLIENT
          ? SenderRole.CLIENT
          : SenderRole.TECHNICIAN;

      const message = await this.chatService.saveMessage(
        roomId,
        RoomType.REQUEST,
        user.userId,
        senderRole,
        data.content.trim(),
      );

      this.server.to(roomId).emit('newMessage', {
        _id: message._id,
        roomId,
        roomType: RoomType.REQUEST,
        senderId: user.userId,
        senderRole,
        content: message.content,
        isRead: false,
        createdAt: message.createdAt,
      });
    } catch (error) {
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

  // ── 2. Community Chat ────────────────────────────────────────────────────

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

      // آخر 50 رسالة للـ history
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

  // ── 3. Support Chat ──────────────────────────────────────────────────────

  @SubscribeMessage('joinSupport')
  async handleJoinSupport(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId?: string }, // الـ admin بيبعت userId، الـ user مبيبعتش حاجة
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) throw new WsException('Unauthorized');

    try {
      // الـ admin يدخل room أي user، غيره يدخل room بتاعته بس
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

  // ── Public method ────────────────────────────────────────────────────────

  closeRoom(requestId: string) {
    const roomId = `room_${requestId}`;
    this.server.to(roomId).emit('roomClosed', {
      roomId,
      message: 'This request has been completed or cancelled.',
    });
    this.server.in(roomId).socketsLeave(roomId);
  }
}

// function constructor(
//   private: any,
//   chatService: any,
//   ChatService: typeof ChatService,
//   private1: any,
//   jwtService: any,
//   JwtService: typeof JwtService,
// ) {
//   throw new Error('Function not implemented.');
// }

// function handleConnection(client: any, Socket: typeof Socket) {
//   throw new Error('Function not implemented.');
// }

// function handleDisconnect(client: any, Socket: typeof Socket) {
//   throw new Error('Function not implemented.');
// }

// function handleJoinRoom(
//   arg0: any,
//   client: any,
//   Socket: typeof Socket,
//   arg3: any,
//   data: any,
//   arg5: { requestId: any },
// ) {
//   throw new Error('Function not implemented.');
// }

// function handleSendMessage(
//   arg0: any,
//   client: any,
//   Socket: typeof Socket,
//   arg3: any,
//   data: any,
//   arg5: { requestId: any; content: any },
// ) {
//   throw new Error('Function not implemented.');
// }

// function handleMarkAsRead(
//   arg0: any,
//   client: any,
//   Socket: typeof Socket,
//   arg3: any,
//   data: any,
//   arg5: { requestId: any },
// ) {
//   throw new Error('Function not implemented.');
// }

// function handleJoinCommunity(
//   arg0: any,
//   client: any,
//   Socket: typeof Socket,
//   arg3: any,
//   data: any,
//   arg5: { categoryId: any },
// ) {
//   throw new Error('Function not implemented.');
// }

// function handleCommunityMessage(
//   arg0: any,
//   client: any,
//   Socket: typeof Socket,
//   arg3: any,
//   data: any,
//   arg5: { categoryId: any; content: any },
// ) {
//   throw new Error('Function not implemented.');
// }

// function handleJoinSupport(
//   arg0: any,
//   client: any,
//   Socket: typeof Socket,
//   arg3: any,
//   data: any,
//   arg5: { userId: any },
// ) {
//   throw new Error('Function not implemented.');
// }

// function handleSupportMessage(
//   arg0: any,
//   client: any,
//   Socket: typeof Socket,
//   arg3: any,
//   data: any,
//   arg5: { targetUserId: any; content: any },
// ) {
//   throw new Error('Function not implemented.');
// }

// function closeRoom(requestId: any, string: any) {
//   throw new Error('Function not implemented.');
// }
