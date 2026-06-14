import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

export enum SenderRole {
  CLIENT = 'client',
  TECHNICIAN = 'technician',
}

@Schema({ timestamps: true })
export class Message {
  @Prop({
    type: Types.ObjectId,
    ref: 'MainRequest',
    required: true,
    index: true,
  })
  requestId: Types.ObjectId; // كل رسايل الـ request في room واحدة

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ enum: SenderRole, required: true })
  senderRole: SenderRole;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// بسرعة نجيب كل رسايل request معين مرتبة
MessageSchema.index({ requestId: 1, createdAt: 1 });
