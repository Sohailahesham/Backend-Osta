import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Message,
  MessageDocument,
  RoomType,
  SenderRole,
} from './schemas/message.schema';
import {
  MainRequest,
  RequestDocument,
} from 'src/request/schemas/request.schema';
import {
  Technician,
  TechnicianDocument,
} from 'src/technician/schemas/technician.schema';
import { RequestStatus } from 'src/request/enums/request-status.enum';
import { UserRole } from 'src/users/schemas/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,

    @InjectModel(MainRequest.name)
    private requestModel: Model<RequestDocument>,

    @InjectModel(Technician.name)
    private technicianModel: Model<TechnicianDocument>,
  ) {}

  // ── Request Chat ─────────────────────────────────────────────────────────

  async validateRequestAccess(
    requestId: string,
    userId: string,
    role: UserRole,
  ): Promise<MainRequest> {
    const request = await this.requestModel.findById(requestId).lean();
    if (!request) throw new NotFoundException('Request not found');

    const allowedStatuses = [
      RequestStatus.ACCEPTED,
      RequestStatus.IN_PROGRESS,
      RequestStatus.ON_THE_WAY,
      RequestStatus.STARTED,
    ];
    if (!allowedStatuses.includes(request.status)) {
      throw new ForbiddenException(
        'You can only chat with requests that are accepted, in progress, on the way or started',
      );
    }

    const isClient =
      role === UserRole.CLIENT && request.userId.toString() === userId;
    const isTechnician =
      role === UserRole.TECHNICIAN &&
      request.assignedTechnician?.toString() === userId;

    if (!isClient && !isTechnician) {
      throw new ForbiddenException('You are not part of this request');
    }

    return request;
  }

  // ── Community Chat ───────────────────────────────────────────────────────

  async validateCommunityAccess(
    categoryId: string,
    userId: string,
    role: UserRole,
  ): Promise<void> {
    if (role !== UserRole.TECHNICIAN) {
      throw new ForbiddenException('Community chat is for technicians only');
    }

    const technician = await this.technicianModel.findOne({
      userId: new Types.ObjectId(userId),
      'specialization.categoryId': new Types.ObjectId(categoryId),
    });

    if (!technician) {
      throw new ForbiddenException('You are not a member of this community');
    }
  }

  // ── Support Chat ─────────────────────────────────────────────────────────

  validateSupportAccess(
    targetUserId: string,
    userId: string,
    role: UserRole,
  ): void {
    if (role === UserRole.ADMIN) return;
    if (targetUserId !== userId) {
      throw new ForbiddenException('You can only access your own support chat');
    }
  }

  // ── Shared: Save Message ─────────────────────────────────────────────────

  async saveMessage(
    roomId: string,
    roomType: RoomType,
    senderId: string,
    senderRole: SenderRole,
    content: string,
  ): Promise<MessageDocument> {
    return this.messageModel.create({
      roomId,
      roomType,
      senderId: new Types.ObjectId(senderId),
      senderRole,
      content,
    });
  }

  // ── Shared: Get Messages ─────────────────────────────────────────────────

  async getMessages(roomId: string, limit = 50) {
    return this.messageModel
    .find({ roomId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('senderId', 'fullName')
    .lean();
  }

  // ── Request Chat: History (REST) ─────────────────────────────────────────

  async getRequestMessages(requestId: string, userId: string, role: UserRole) {
    await this.validateRequestAccess(requestId, userId, role);

    const roomId = `room_${requestId}`;
    const messages = await this.messageModel
    .find({ roomId })
    .sort({ createdAt: 1 })
    .populate('senderId', 'fullName')
    .lean();

    await this.messageModel.updateMany(
      { roomId, senderId: { $ne: new Types.ObjectId(userId) }, isRead: false },
      { isRead: true },
    );

    return { message: 'Messages retrieved successfully', data: messages };
  }

  // ── Unread Count ─────────────────────────────────────────────────────────

  async getUnreadCount(roomId: string, userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      roomId,
      senderId: { $ne: new Types.ObjectId(userId) },
      isRead: false,
    });
  }

  async markAsRead(roomId: string, userId: string) {
    await this.messageModel.updateMany(
      { roomId, senderId: { $ne: new Types.ObjectId(userId) }, isRead: false },
      { isRead: true },
    );
  }
}
