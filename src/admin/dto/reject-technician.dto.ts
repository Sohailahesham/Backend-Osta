import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectTechnicianDto {
  @ApiProperty({
    description: 'Reason for rejecting the technician registration',
    example: 'Incomplete documentation provided',
    minLength: 5,
    maxLength: 300,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(300)
  reason: string;
}
