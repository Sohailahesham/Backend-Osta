import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { WorkingDay } from '../schemas/technician.schema';


export class Step3Dto {
  @IsNumber()
  yearsOfExperience: number;
  
  @IsBoolean()
  hasTools: boolean;

  @IsBoolean()
  hasTransportation: boolean;

  @IsArray()
  @IsEnum(WorkingDay, { each: true, message: 'Invalid working day' })
  workingDays:  WorkingDay[];

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;
}