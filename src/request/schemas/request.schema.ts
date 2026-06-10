import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DepositStatus, RequestStatus } from '../enums/request-status.enum';
import { UserRole } from 'src/users/schemas/user.schema';
export type RequestDocument = MainRequest & Document;

@Schema({ timestamps: true })
export class MainRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ServiceEntity', required: true })
  serviceId: Types.ObjectId;

  @Prop({ required: true })
  preferredDate: Date;

  @Prop({ required: true, trim: true })
  preferredTime: string; // e.g. "10:00 AM" or "14:00"

  @Prop({
    type: String,
    enum: Object.values(RequestStatus),
    default: RequestStatus.PENDING,
    index: true,
  })
  status: RequestStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedTechnician: Types.ObjectId | null;

  @Prop({ default: 50 })
  depositAmount: number;

  @Prop({
    type: String,
    enum: Object.values(DepositStatus),
    default: DepositStatus.UNPAID,
  })
  depositStatus: DepositStatus;

  @Prop({ default: 0 })
  totalPrice: number;

  @Prop({ type: Types.ObjectId, ref: 'Payment', default: null })
  paymentId: Types.ObjectId | null;

  @Prop({ default: false })
  isFullyPaid: boolean;

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

  @Prop({ type: String, trim: true, default: null })
  notes: string | null;

  @Prop({ type: String, trim: true, default: null })
  completionNote: string | null;

  // createdAt & updatedAt auto-added by { timestamps: true }
  createdAt: Date;
  updatedAt: Date;

  @Prop({
    type: {
      cancelledBy: { type: Types.ObjectId, ref: 'User' },
      role: { type: String, enum: Object.values(UserRole) },
      reason: { type: String, trim: true },
      cancelledAt: { type: Date },
    },
    default: null,
    _id: false,
  })
  cancellation: {
    cancelledBy: Types.ObjectId;
    role: UserRole;
    reason?: string;
    cancelledAt: Date;
  } | null;
}

export const RequestSchema = SchemaFactory.createForClass(MainRequest);
