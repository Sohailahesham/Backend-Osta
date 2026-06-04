/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Expose, Transform } from 'class-transformer';

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
  specializations: string[];

  @Expose()
  hasTools: boolean;

  @Expose()
  hasTransportation: boolean;

  @Expose()
  workingDays: string[];

  @Expose()
  serviceAreas: string[];

  @Expose()
  canWorkOutsideArea: boolean;

  @Expose()
  verificationStatus: string;

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
