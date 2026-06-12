import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletDocument = Wallet & Document;

export enum TransactionType {
  CREDIT = 'credit',   // فلوس دخلت
  DEBIT = 'debit',     // فلوس طلعت
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Schema({ _id: true, timestamps: true })
export class WalletTransaction {
  @Prop({ enum: TransactionType, required: true })
  type: TransactionType;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: TransactionStatus, default: TransactionStatus.COMPLETED })
  status: TransactionStatus;

  @Prop({ type: Types.ObjectId, ref: 'MainRequest', default: null })
  requestId: Types.ObjectId | null;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const WalletTransactionSchema = SchemaFactory.createForClass(WalletTransaction);

@Schema({ timestamps: true })
export class Wallet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: 0 })
  totalEarned: number;

  @Prop({ default: 0 })
  totalWithdrawn: number;

  @Prop({ type: [WalletTransactionSchema], default: [] })
  transactions: WalletTransaction[];
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);