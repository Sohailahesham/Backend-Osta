import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WithdrawalDocument = Withdrawal & Document;

export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum WithdrawalMethod {
  INSTAPAY = 'instapay',
  VODAFONE_CASH = 'vodafone_cash',
}

@Schema({ timestamps: true })
export class Withdrawal {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: WithdrawalMethod, required: true })
  method: WithdrawalMethod;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ enum: WithdrawalStatus, default: WithdrawalStatus.PENDING })
  status: WithdrawalStatus;

  @Prop()
  rejectionReason?: string;

  @Prop()
  processedAt?: Date;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);