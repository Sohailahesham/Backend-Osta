import { Expose, Transform, Type } from 'class-transformer';
import { VerificationStatus } from 'src/technician/schemas/technician.schema';

// ── الـ User data اللي جوا الـ populate ──────────────────
class TechnicianUserDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @Expose() fullName: string;
  @Expose() email: string;
  @Expose() phone: string;
  @Expose() gender: string;
  @Expose() governorate: string;
  @Expose() city: string;
  @Expose() isVerified: boolean;
  @Expose() createdAt: Date;
}

// ── الـ Specialization sub-document ──────────────────────
class SpecializationDto {
  @Expose()
  @Transform(({ obj }) => obj?.categoryId?.toString())
  categoryId: string;

  @Expose()
  @Transform(({ obj }) =>
    Array.isArray(obj?.serviceIds)
      ? obj.serviceIds.map((id: any) => id?.toString())
      : [],
  )
  serviceIds: string[];
}

// ── الـ DTO الرئيسي ───────────────────────────────────────
export class AdminTechnicianDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string; // Technician document id

  // بيانات الـ User المربوطة عبر populate
  @Expose()
  @Type(() => TechnicianUserDto)
  userId: TechnicianUserDto;

  // ── Professional ──
  @Expose()
  @Type(() => SpecializationDto)
  specialization: SpecializationDto;

  @Expose() yearsOfExperience: number;
  @Expose() hasTools: boolean;
  @Expose() hasTransportation: boolean;

  // ── Schedule ──
  @Expose() workingDays: string[];
  @Expose() startTime: string;
  @Expose() endTime: string;

  // ── Service Areas ──
  @Expose() serviceAreas: string[];
  @Expose() canWorkOutsideArea: boolean;

  // ── Documents ──
  @Expose() personalImage: string;
  @Expose() idFrontImage: string;
  @Expose() idBackImage: string;
  @Expose() certificateImage: string;
  @Expose() criminalRecordImage?: string;

  // ── Verification ──
  @Expose() verificationStatus: VerificationStatus;
  @Expose() rejectionReason?: string;
  @Expose() verifiedAt?: Date;
  @Expose() currentStep: number;
  @Expose() isProfileComplete: boolean;

  // ── Stats ──
  @Expose() isAvailable: boolean;
  @Expose() averageRating: number;
  @Expose() totalReviews: number;

  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
