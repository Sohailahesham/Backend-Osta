import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationGateway } from './notification.gateway';
import { NotificationType } from './enums/notification-type.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  // ─────────────────────────────────────────────
  //  Core: create & push in one step
  // ─────────────────────────────────────────────

  async send(dto: CreateNotificationDto): Promise<NotificationDocument> {
    const notification = await this.notificationModel.create({
      recipientId: new Types.ObjectId(dto.recipientId),
      title: dto.title,
      body: dto.body,
      type: dto.type,
      requestId: dto.requestId ? new Types.ObjectId(dto.requestId) : undefined,
      metadata: dto.metadata ?? {},
    });

    // Push real-time event to the recipient's private room via WebSocket
    this.notificationGateway.sendToUser(dto.recipientId, {
      _id: (notification._id as Types.ObjectId).toString(),
      title: notification.title,
      body: notification.body,
      type: notification.type,
      requestId: dto.requestId,
      metadata: notification.metadata,
      isRead: false,
      createdAt: (notification as any).createdAt,
    });

    return notification;
  }

  // ─────────────────────────────────────────────
  //  Query helpers
  // ─────────────────────────────────────────────

  /** Return all notifications for a user, newest first, with pagination */
  async findByUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: NotificationDocument[]; meta: object }> {
    const filter = { recipientId: new Types.ObjectId(userId) };
    const [data, total] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Count unread notifications for the badge counter */
  async countUnread(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      recipientId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  /** Mark a single notification as read */
  async markRead(notificationId: string): Promise<NotificationDocument | null> {
    return this.notificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true },
    );
  }

  /** Mark ALL unread notifications for a user as read */
  async markAllRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { recipientId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    );
  }

  /**
   * Check if a user already has an UNREAD notification of a given type.
   * Used to avoid sending duplicate repeated reminders (e.g. daily verification
   * reminder) before the user has even read the previous one.
   */
  async hasUnreadOfType(
    userId: string,
    type: NotificationType,
  ): Promise<boolean> {
    const existing = await this.notificationModel.exists({
      recipientId: new Types.ObjectId(userId),
      type,
      isRead: false,
    });
    return !!existing;
  }
}