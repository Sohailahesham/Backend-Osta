import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class Step3Dto {
  @IsNumber()
  yearsOfExperience: number;

  @IsBoolean()
  hasTools: boolean;

  @IsBoolean()
  hasTransportation: boolean;

  @IsArray()
  @IsString({ each: true })
  workingDays: string[];

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;
}