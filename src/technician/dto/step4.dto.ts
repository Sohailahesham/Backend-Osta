import { IsArray, IsBoolean, IsString } from 'class-validator';

export class Step4Dto {

  @IsArray()
  @IsString({ each: true })
  serviceAreas: string[];

  @IsBoolean()
  canWorkOutsideArea: boolean;
}