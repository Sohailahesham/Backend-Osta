import { IsNotEmpty, IsString } from 'class-validator';

export class RejectTechnicianDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
