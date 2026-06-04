import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RejectTechnicianDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(300)
  reason: string;
}
