import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  technicianId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ServiceEntity', required: true })
  serviceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Request', required: true, unique: true })
  requestId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ trim: true, maxlength: 500 })
  comment?: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// منع الـ user من review نفس الـ request أكتر من مرة
ReviewSchema.index({ requestId: 1 }, { unique: true });
// لجيب reviews الـ technician بسرعة
ReviewSchema.index({ technicianId: 1 });
// لجيب reviews الـ service بسرعة
ReviewSchema.index({ serviceId: 1 });
