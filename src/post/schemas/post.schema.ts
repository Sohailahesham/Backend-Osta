import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

export enum PostStatus {
  OPEN = 'open',
  ACCEPTED = 'accepted',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({
    type: {
      fullAddress: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    required: true,
    _id: false,
  })
  address: {
    fullAddress: string;
    district: string;
    coordinates?: { lat: number; lng: number };
  };

  @Prop({ type: String, default: null })
  image: string | null;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: false })
  isEmergency: boolean;

  @Prop({ type :Number , default: null })
  budget: number | null;

  @Prop({ required: true })
  preferredDate: Date;

  @Prop({ required: true, trim: true })
  preferredTime: string;

  @Prop({
    type: String,
    enum: Object.values(PostStatus),
    default: PostStatus.OPEN,
    index: true,
  })
  status: PostStatus;

  @Prop({ type: Types.ObjectId, ref: 'Proposal', default: null })
  acceptedProposal: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'MainRequest', default: null })
  requestId: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
