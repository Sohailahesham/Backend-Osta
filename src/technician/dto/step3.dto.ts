import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkingDay } from '../schemas/technician.schema';

export class Step3Dto {
  @ApiProperty({
    description: 'Years of professional experience',
    example: 5,
    type: Number,
  })
  @IsNumber()
  yearsOfExperience: number;

  @ApiProperty({
    description: 'Does the technician have their own tools',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  hasTools: boolean;

  @ApiProperty({
    description: 'Does the technician have their own transportation',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  hasTransportation: boolean;

  @ApiProperty({
    description: 'Days available for work',
    example: [WorkingDay.SATURDAY, WorkingDay.SUNDAY],
    enum: WorkingDay,
    isArray: true,
    type: [String],
  })
  @IsArray()
  @IsEnum(WorkingDay, { each: true, message: 'Invalid working day' })
  workingDays: WorkingDay[];

  @ApiProperty({
    description: 'Start time for work (HH:mm format)',
    example: '09:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'End time for work (HH:mm format)',
    example: '17:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsNotEmpty()
  @IsString()
  endTime: string;
}
