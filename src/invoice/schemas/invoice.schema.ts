import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'MainRequest', required: true })
  requestId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  technicianId: Types.ObjectId;

  @Prop({ required: true })
  depositAmount: number;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ required: true })
  remainingAmount: number;

  @Prop({ default: false })
  isPaid: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);