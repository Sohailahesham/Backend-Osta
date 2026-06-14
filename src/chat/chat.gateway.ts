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
import { SenderRole } from './schemas/message.schema';
import { UserRole } from 'src/users/schemas/user.schema';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: '/chat', // ws://localhost:3000/chat
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

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
      //* check token exists and is valid
      const token =
        client.handshake.auth?.token?.replace('Bearer ', '') ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.emit('error', { message: 'No token provided' });
        client.disconnect();
        return;
      }

      //*
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      // حفظ بيانات الـ user مع الـ socket
      this.connectedUsers.set(client.id, {
        userId: payload.sub,
        role: payload.role,
        email: payload.email,
      });

      console.log(`✅ User connected: ${payload.email} [${client.id}]`);
    } catch {
      client.emit('error', { message: 'Invalid or expired token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      console.log(`❌ User disconnected: ${user.email} [${client.id}]`);
      this.connectedUsers.delete(client.id);
    }
  }

  // ── Events ───────────────────────────────────────────────────────────────

  // الـ client يدخل الـ room بتاعت الـ request
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) throw new WsException('Unauthorized');

    try {
      // تحقق إن الـ user مسموحله يدخل الـ room دي
      await this.chatService.validateRoomAccess(
        data.requestId,
        user.userId,
        user.role,
      );

      const room = `room_${data.requestId}`;
      await client.join(room);

      // عدد الرسايل الغير مقروءة
      const unreadCount = await this.chatService.getUnreadCount(
        data.requestId,
        user.userId,
      );

      client.emit('joinedRoom', {
        requestId: data.requestId,
        room,
        unreadCount,
      });

      // إبلاغ الطرف التاني إن حد دخل
      client.to(room).emit('userJoined', {
        userId: user.userId,
        role: user.role,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // إرسال رسالة
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string; content: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) throw new WsException('Unauthorized');

    if (!data.content?.trim()) {
      client.emit('error', { message: 'Message content cannot be empty' });
      return;
    }

    if (data.content.length > 1000) {
      client.emit('error', {
        message: 'Message too long (max 1000 characters)',
      });
      return;
    }

    try {
      // التحقق من الـ access
      await this.chatService.validateRoomAccess(
        data.requestId,
        user.userId,
        user.role,
      );

      const senderRole =
        user.role === UserRole.CLIENT
          ? SenderRole.CLIENT
          : SenderRole.TECHNICIAN;

      // حفظ الرسالة في الـ DB
      const message = await this.chatService.saveMessage(
        data.requestId,
        user.userId,
        senderRole,
        data.content.trim(),
      );

      const room = `room_${data.requestId}`;

      // إرسال الرسالة لكل الـ room (الاتنين)
      this.server.to(room).emit('newMessage', {
        _id: message._id,
        requestId: data.requestId,
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

  // mark messages as read
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) throw new WsException('Unauthorized');

    await this.chatService.markAsRead(data.requestId, user.userId);

    const room = `room_${data.requestId}`;
    // إبلاغ الطرف التاني إن رسايله اتقرأت
    client.to(room).emit('messagesRead', {
      requestId: data.requestId,
      readBy: user.userId,
    });
  }

  // ── Public method — بيتستدعى من request.service لما يتـ complete أو cancel ──

  closeRoom(requestId: string) {
    const room = `room_${requestId}`;
    this.server.to(room).emit('roomClosed', {
      requestId,
      message:
        'This request has been completed or cancelled. Chat is now closed.',
    });
    // إزالة كل الـ sockets من الـ room
    this.server.in(room).socketsLeave(room);
  }
}
