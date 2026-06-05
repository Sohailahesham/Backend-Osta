/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Expose, Transform } from 'class-transformer';

export class TechnicianDataDto {
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
  governorate: string;

  @Expose()
  city: string;

  @Expose()
  specializations: string[];

  @Expose()
  yearsOfExperience: number;

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
  personalImage: string;

  @Expose()
  idFrontImage: string;

  @Expose()
  idBackImage: string;

  @Expose()
  certificateImage: string;

  @Expose()
  criminalRecordImage?: string;
}
