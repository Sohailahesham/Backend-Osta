/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Expose, Transform } from 'class-transformer';
import { TechnicianSpecialization } from 'src/technician/schemas/technician.schema';

export class TechnicianDataDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  _id: string;

  @Expose()
  @Transform(({ obj }) => obj.userId?.fullName)
  fullName: string;

  @Expose()
  @Transform(({ obj }) => obj.userId?.email)
  email: string;

  @Expose()
  @Transform(({ obj }) => obj.userId?.phone)
  phone: string;

  @Expose()
  @Transform(({ obj }) => obj.userId?.governorate)
  governorate: string;

  @Expose()
  @Transform(({ obj }) => obj.userId?.city)
  city: string;

  @Expose()
  @Transform(({ obj }) => obj.specialization?.categoryId?.name)
  category: string;

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
jobTitle: string;

@Expose()
@Transform(({ obj }) => obj.specialization?.categoryId?._id?.toString())
categoryId: string;

@Expose()
@Transform(({ obj }) =>
  (obj.specialization?.serviceIds ?? []).map((s: any) => ({
    id: s._id?.toString(),
    name: s.name,
  })),
)
services: { id: string; name: string }[];
}