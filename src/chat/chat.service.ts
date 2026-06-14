import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument, SenderRole } from './schemas/message.schema';
import {
  MainRequest,
  RequestDocument,
} from 'src/request/schemas/request.schema';
import { RequestStatus } from 'src/request/enums/request-status.enum';
import { UserRole } from 'src/users/schemas/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,

    @InjectModel(MainRequest.name)
    private requestModel: Model<RequestDocument>,
  ) {}

  //* validate room access
  async validateRoomAccess(
    requestId: string,
    userId: string,
    role: UserRole,
  ): Promise<MainRequest> {
    const request = await this.requestModel.findById(requestId).lean();

    if (!request) throw new NotFoundException('Request not found');

    //* check if request is in allowed statuses
    const allowedStatuses = [
      RequestStatus.ACCEPTED,
      RequestStatus.IN_PROGRESS,
      RequestStatus.ON_THE_WAY,
      RequestStatus.STARTED,
    ];
    if (!allowedStatuses.includes(request.status)) {
      throw new ForbiddenException('Chat is not available for this request');
    }

    //* check if user is part of this request
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

  //* save message in db
  async saveMessage(
    requestId: string,
    senderId: string,
    senderRole: SenderRole,
    content: string,
  ): Promise<MessageDocument> {
    return this.messageModel.create({
      requestId: new Types.ObjectId(requestId),
      senderId: new Types.ObjectId(senderId),
      senderRole,
      content,
    });
  }

  //* get all messages
  async getMessages(requestId: string, userId: string, role: UserRole) {
    await this.validateRoomAccess(requestId, userId, role);

    const messages = await this.messageModel
    .find({ requestId: new Types.ObjectId(requestId) })
    .sort({ createdAt: 1 })
    .populate('senderId', 'fullName')
    .lean();

    // mark كل الرسايل اللي مش بتاعته كـ read
    await this.messageModel.updateMany(
      {
        requestId: new Types.ObjectId(requestId),
        senderId: { $ne: new Types.ObjectId(userId) },
        isRead: false,
      },
      { isRead: true },
    );

    return { message: 'Messages retrieved successfully', data: messages };
  }

  //* mark messages as read
  async markAsRead(requestId: string, userId: string) {
    await this.messageModel.updateMany(
      {
        requestId: new Types.ObjectId(requestId),
        senderId: { $ne: new Types.ObjectId(userId) },
        isRead: false,
      },
      { isRead: true },
    );
  }

  //* get unread messages count
  async getUnreadCount(requestId: string, userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      requestId: new Types.ObjectId(requestId),
      senderId: { $ne: new Types.ObjectId(userId) },
      isRead: false,
    });
  }
}
