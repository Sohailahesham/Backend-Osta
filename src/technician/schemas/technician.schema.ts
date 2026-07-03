import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

export type TechnicianDocument  = Technician & Document;


export enum VerificationStatus {
  INCOMPLETE = 'incomplete',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum WorkingDay {
  SATURDAY = 'السبت',
  SUNDAY = 'الأحد',
  MONDAY = 'الاثنين',
  TUESDAY = 'الثلاثاء',
  WEDNESDAY = 'الأربعاء',
  THURSDAY = 'الخميس',
  FRIDAY = 'الجمعة',
}

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

// ========== TECHNICIAN PROFILE ==========

@Schema({ timestamps: true })
export class Technician {

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  userId: Types.ObjectId;

  // ========== SPECIALIZATION ==========

  @Prop({ type: TechnicianSpecializationSchema, default: null })
  specialization: TechnicianSpecialization;
  // ========== PROFILE (editable) ==========

@Prop({ trim: true, default: '' })
jobTitle: string;

  // ========== step3 ===========
  @Prop({ min: 0, default: 0 })
  yearsOfExperience: number;
  
  @Prop({ default: false })
  hasTools: boolean;

  @Prop({ default: false })
  hasTransportation: boolean;

  @Prop({ type: [String], enum: WorkingDay, default: [] })
  workingDays: WorkingDay[];

  @Prop()
  startTime: string;

  @Prop()
  endTime: string;

  // ========== step4 ==========

  @Prop({ default: [] })
  serviceAreas: string[];

  @Prop({ default: false })
  canWorkOutsideArea: boolean;

  // ========== step5 ==========

  @Prop()
  idFrontImage: string;

  @Prop()
  idBackImage: string;

  @Prop()
  personalImage: string;

  @Prop()
  certificateImage: string;

  @Prop()
  criminalRecordImage?: string;
  
  // ========== VERIFICATION STATUS ==========
  
  @Prop({ default: 1 })
  currentStep: number;

  @Prop({
    enum: VerificationStatus,
    default: VerificationStatus.INCOMPLETE,
  })
  verificationStatus: VerificationStatus;

  @Prop({ default: false })
  isProfileComplete: boolean;

  @Prop()
  verifiedAt?: Date;

  @Prop()
  rejectionReason?: string;

  // ========== RATINGS ==========

  @Prop({ default: 0 })
  averageRating: number;
  
  @Prop({ default: 0 })
  totalReviews: number;

  @Prop({ default: true })
  isAvailable: boolean;
}
export const TechnicianSchema =
  SchemaFactory.createForClass(Technician);

// if technician deleted it will delete from user also 
TechnicianSchema.pre('findOneAndDelete', async function () {
  const technician = await this.model.findOne(this.getFilter());
  if (technician) {
    await mongoose.model('User').findByIdAndDelete(technician.userId);
  }
});


