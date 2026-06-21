import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TicketStatus } from '../enums/ticket-status.enum';

export type SupportTicketDocument = SupportTicket & Document;

@Schema({ timestamps: true })
export class SupportTicket {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  // Human-readable ticket number shown in the UI, e.g. "OST-10248"
  @Prop({ required: true, unique: true, trim: true })
  ticketNumber: string;

  @Prop({ required: true, trim: true, maxlength: 150 })
  title: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  description: string;

  @Prop({
    type: String,
    enum: Object.values(TicketStatus),
    default: TicketStatus.OPEN,
    index: true,
  })
  status: TicketStatus;

  @Prop({ type: String, default: null })
  attachmentUrl?: string | null;

  @Prop({ type: String, default: null })
  attachmentName?: string | null;

  @Prop({ type: Number, default: null })
  attachmentSize?: number | null;
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);
