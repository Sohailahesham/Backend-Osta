import {
  IsString, IsNotEmpty, IsOptional, IsBoolean,
  IsMongoId, IsArray, IsNumber, Min, Max,
  IsUppercase, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PriceRangeDto {
  @IsNumber()
  @Min(0)
  min!: number;

  @IsNumber()
  @Min(0)
  max!: number;
}

export class FixingStepsDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includes?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  doesNotInclude?: string[];
}
/***************************will be separated ********* */
export class AddCommentDto {
  @IsMongoId()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsString()
  @IsOptional()
  userAvatar?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @IsNotEmpty()
  text!: string;
}
/********************************************************* */

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @IsUppercase()
  key!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsMongoId()
  category!: string;

  @ValidateNested()
  @Type(() => PriceRangeDto)
  priceRange!: PriceRangeDto;

  @ValidateNested()
  @Type(() => FixingStepsDto)
  @IsOptional()
  fixingSteps?: FixingStepsDto;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}