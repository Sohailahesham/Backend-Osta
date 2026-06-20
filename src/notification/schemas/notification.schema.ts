import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationType } from '../enums/notification-type.enum';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  /** The user who receives this notification (client or technician userId) */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  recipientId: Types.ObjectId;

  /** Human-readable title shown in the notification bell */
  @Prop({ required: true })
  title: string;

  /** Full body message */
  @Prop({ required: true })
  body: string;

  /** Enum so the frontend can show the right icon / route */
  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  /** The request that triggered this notification */
  @Prop({ type: Types.ObjectId, ref: 'MainRequest', required: false })
  requestId?: Types.ObjectId;

  /** Extra key-value data the frontend might need (e.g. depositAmount) */
  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  /** false until the user opens / acknowledges the notification */
  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
