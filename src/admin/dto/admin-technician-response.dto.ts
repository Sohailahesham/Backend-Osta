/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Expose, Transform } from 'class-transformer';
import {
  TechnicianSpecialization,
  VerificationStatus,
} from 'src/users/schemas/user.schema';

export class AdminTechnicianDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  role: string;

  @Expose()
  governorate: string;

  @Expose()
  city: string;

  @Expose()
  specialization: TechnicianSpecialization;

  @Expose()
  yearsOfExperience: number;

  @Expose()
  hasTools: boolean;

  @Expose()
  hasTransportation: boolean;

  @Expose()
  workingDays: string[];

  @Expose()
  startTime: string;

  @Expose()
  endTime: string;

  @Expose()
  serviceAreas: string[];

  @Expose()
  canWorkOutsideArea: boolean;

  @Expose()
  verificationStatus: VerificationStatus;

  @Expose()
  personalImage: string;

  @Expose()
  idFrontImage: string;

  @Expose()
  idBackImage: string;

  @Expose()
  certificateImage: string;

  @Expose()
  criminalRecordImage?: string;

  @Expose()
  rejectionReason?: string;

  @Expose()
  verifiedAt?: Date;

  @Expose()
  currentStep: number;

  @Expose()
  isProfileComplete: boolean;

  @Expose()
  isAvailable: boolean;

  @Expose()
  averageRating: number;

  @Expose()
  totalReviews: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
