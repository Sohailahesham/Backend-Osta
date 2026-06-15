import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

export enum SenderRole {
  CLIENT = 'client',
  TECHNICIAN = 'technician',
  ADMIN = 'admin',
}

export enum RoomType {
  REQUEST = 'request', // client ↔ technician — بتمسح بعد 30 يوم
  COMMUNITY = 'community', // technicians من نفس الـ category — بتمسح بعد 30 يوم
  SUPPORT = 'support', // user ↔ admin — بتمسح بعد 90 يوم
}

@Schema({ timestamps: true })
export class Message {
  // ── Room identifier ──────────────────────────────────────────────────────
  @Prop({ required: true, index: true })
  roomId: string;
  // request   → `room_{requestId}`
  // community → `community_{categoryId}`
  // support   → `support_{userId}`

  @Prop({ enum: RoomType, required: true, index: true })
  roomType: RoomType;

  // ── Sender ───────────────────────────────────────────────────────────────
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ enum: SenderRole, required: true })
  senderRole: SenderRole;

  // ── Content ──────────────────────────────────────────────────────────────
  @Prop({ required: true, trim: true, maxlength: 1000 })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// index للـ queries الأساسية
MessageSchema.index({ roomId: 1, createdAt: 1 });
MessageSchema.index({ roomId: 1, roomType: 1 });

// ── TTL indexes — بيمسح الرسايل أوتوماتيك ──────────────────────────────────
// request + community → 30 يوم
MessageSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: {
      roomType: { $in: [RoomType.REQUEST, RoomType.COMMUNITY] },
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
