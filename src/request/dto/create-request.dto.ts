import { Type } from 'class-transformer';
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
  Matches,
} from 'class-validator';

class CoordinatesDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

class AddressDto {
  @IsString()
  @IsNotEmpty()
  fullAddress: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsOptional()
  coordinates?: CoordinatesDto;
}

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @IsMongoId()
  @IsNotEmpty()
  serviceId: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsDateString()
  preferredDate: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d(\s?(AM|PM))?$/i, {
    message: 'preferredTime must be a valid time e.g. "14:00" or "2:00 PM"',
  })
  preferredTime: string;
}