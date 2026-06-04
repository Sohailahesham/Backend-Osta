import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  CLIENT = 'client',
  TECHNICIAN = 'technician',
  ADMIN = 'admin',
}

export enum Specialization {
  PLUMBER = 'Plumber',
  ELECTRICIAN = 'Electrician',
  CARPENTER = 'Carpenter',
  AC = 'Ac',
}

export enum VerificationStatus {
  INCOMPLETE = 'incomplete',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class User {
  // Basic Information
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone: string;

  @Prop({
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Prop()
  refreshToken: string;

  @Prop({ required: true })
  governorate: string;

  @Prop({ required: true })
  city: string;

  // Technician Step 2

  @Prop({
    type: [String],
    enum: Specialization,
    default: [],
  })
  specializations: Specialization[];

  @Prop()
  yearsOfExperience: number;

  @Prop({ default: false })
  hasTools: boolean;

  @Prop({ default: false })
  hasTransportation: boolean;

  @Prop({ default: [] })
  workingDays: string[];

  @Prop()
  startTime: string;

  @Prop()
  endTime: string;

  // Technician Step 3

  @Prop({ default: [] })
  serviceAreas: string[];

  @Prop({ default: false })
  canWorkOutsideArea: boolean;

  // Technician Step 4

  @Prop()
  personalImage: string;

  @Prop()
  idImage: string;

  @Prop()
  certificateImage: string;

  @Prop({ default: 1 })
  currentStep: number;

  @Prop({
    enum: VerificationStatus,
    default: VerificationStatus.INCOMPLETE,
  })
  verificationStatus: VerificationStatus;

  @Prop({ default: false })
  isProfileComplete: boolean;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: 0 })
  totalReviews: number;

  @Prop()
  verifiedAt: Date;

  @Prop()
  rejectionReason: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
