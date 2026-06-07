import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmergencyDocument = Emergency & Document;

export enum EmergencyType {
  URGENT = 'urgent', //^ طوارئ عاجلة
  UTILITIES = 'utilities', //^ مرافق وخدمات عامة
  SOCIAL = 'social', //^ خدمات اجتماعية وحماية
}

@Schema({ timestamps: true })
export class Emergency {
  @Prop({ required: true, trim: true })
  type: string;

  @Prop({ required: true, trim: true, unique: true })
  name: string;

  @Prop({ required: true, trim: true, unique: true })
  phone: string;

  @Prop({ trim: true })
  description?: string;

  @Prop()
  icon?: string;
}

export const EmergencySchema = SchemaFactory.createForClass(Emergency);
