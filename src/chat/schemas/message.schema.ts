import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

export enum SenderRole {
  CLIENT = 'client',
  TECHNICIAN = 'technician',
  ADMIN = 'admin',
}

export enum RoomType {
  REQUEST = 'request', // fixed service — client ↔ technician بعد الـ accept
  CUSTOM_REQUEST = 'custom', // open post — client ↔ technician بعد الـ proposal
  COMMUNITY = 'community', // technicians من نفس الـ category
  SUPPORT = 'support', // user ↔ admin
}

@Schema({ timestamps: true })
export class Message {
  // ── Room identifier ──────────────────────────────────────────────────────
  @Prop({ required: true, index: true })
  roomId: string;
  // fixed service  → `room_{requestId}`
  // custom request → `custom_{postId}_{technicianId}`
  // community      → `community_{categoryId}`
  // support        → `support_{userId}`

  @Prop({ enum: RoomType, required: true, index: true })
  roomType: RoomType;

  // ── Sender ───────────────────────────────────────────────────────────────
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ enum: SenderRole, required: true })
  senderRole: SenderRole;

  // ── Content ──────────────────────────────────────────────────────────────
  @Prop({ default: '', trim: true, maxlength: 1000 })
  content: string;

  @Prop({ type: String, default: null })
  imageUrl: string | null;

  @Prop({ default: false })
  isRead: boolean;

  // ── Moderation ───────────────────────────────────────────────────────────
  // isBlocked: الرسالة اتبلوكت بالـ Regex — مش بتتحفظش أصلاً (exception بتتترمى)
  // isFlagged: الـ AI شاف إنها مشبوهة — اتحفظت بس محتاجة مراجعة admin
  @Prop({ default: false })
  isFlagged: boolean;

  @Prop({ type: String, default: null })
  flagReason: string | null;

  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// ── Indexes ──────────────────────────────────────────────────────────────────
MessageSchema.index({ roomId: 1, createdAt: 1 });
MessageSchema.index({ roomId: 1, roomType: 1 });
MessageSchema.index({ isFlagged: 1 }); // للـ admin dashboard

// ── TTL indexes ──────────────────────────────────────────────────────────────
// request + custom_request + community → 30 يوم
MessageSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: {
      roomType: {
        $in: [RoomType.REQUEST, RoomType.CUSTOM_REQUEST, RoomType.COMMUNITY],
      },
    },
  },
);

// support → 90 يوم
MessageSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 90 * 24 * 60 * 60,
    partialFilterExpression: { roomType: RoomType.SUPPORT },
  },
);
