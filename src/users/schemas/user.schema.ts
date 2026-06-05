import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

/* ================= AUTH ENUMS ================= */

export enum UserRole {
  CLIENT = 'client',
  TECHNICIAN = 'technician',
  ADMIN = 'admin',
}

export enum VerificationStatus {
  INCOMPLETE = 'incomplete',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

/* ================= TECHNICIAN SPECIALIZATION ================= */

@Schema({ _id: false })
export class TechnicianSpecialization {
  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  categoryId: Types.ObjectId;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'ServiceEntity' }],
    default: [],
  })
  serviceIds: Types.ObjectId[];
}

export const TechnicianSpecializationSchema = SchemaFactory.createForClass(
  TechnicianSpecialization,
);

@Schema({ timestamps: true })
export class User {
  // ========== BASIC INFO ==========

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop()
  password?: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  phone: string;

  // ========== AUTH ==========

  @Prop({
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  provider: AuthProvider;

  @Prop({ unique: true, sparse: true })
  googleId?: string;

  @Prop()
  refreshToken?: string;

  // ========== ROLE ==========

  @Prop({
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  // ========== LOCATION ==========

  @Prop()
  governorate: string;

  @Prop()
  city: string;

  // ========== TECHNICIAN DATA ==========

  @Prop({
    type: TechnicianSpecializationSchema,
  })
  specialization: TechnicianSpecialization;

  @Prop({ min: 0 })
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

  @Prop({ default: [] })
  serviceAreas: string[];

  @Prop({ default: false })
  canWorkOutsideArea: boolean;

  // ========== FILES ==========

  @Prop()
  personalImage: string;

  @Prop()
  idFrontImage: string;

  @Prop()
  idBackImage: string;

  @Prop()
  certificateImage: string;

  @Prop()
  criminalRecordImage?: string;

  // ========== TRACKING ==========

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
