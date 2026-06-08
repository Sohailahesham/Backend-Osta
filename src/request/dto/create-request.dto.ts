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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CoordinatesDto {
  @ApiProperty({
    description: 'Latitude coordinate',
    example: 30.0444,
    type: Number,
  })
  @IsNumber()
  lat: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 31.2357,
    type: Number,
  })
  @IsNumber()
  lng: number;
}

class AddressDto {
  @ApiProperty({
    description: 'Full address string',
    example: '123 Main Street, Cairo, Egypt',
  })
  @IsString()
  @IsNotEmpty()
  fullAddress: string;

  @ApiPropertyOptional({
    description: 'Street name and number',
    example: '123 Main Street',
  })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({
    description: 'City name',
    example: 'Cairo',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'District or area name',
    example: 'Giza',
  })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({
    description: 'Geographic coordinates',
    type: CoordinatesDto,
  })
  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsOptional()
  coordinates?: CoordinatesDto;
}

export class CreateRequestDto {
  @ApiProperty({
    description: 'Brief title of the service request',
    example: 'Bathroom pipe repair',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the service needed',
    example: 'Water is leaking from the main pipe under the bathroom sink',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'MongoDB ID of the service category',
    example: '60d5ec49c1234567890abc12',
    format: 'mongodb-id',
  })
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'MongoDB ID of the specific service',
    example: '60d5ec49c1234567890abc13',
    format: 'mongodb-id',
  })
  @IsMongoId()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({
    description: 'Service location details',
    type: AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({
    description: 'Preferred date for service (ISO format)',
    example: '2024-02-15',
    format: 'date',
  })
  @IsDateString()
  preferredDate: string;

  @ApiProperty({
    description: 'Preferred time for service (HH:mm or h:mm AM/PM)',
    example: '14:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5]\\d(\\s?(AM|PM))?$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d(\s?(AM|PM))?$/i, {
    message: 'preferredTime must be a valid time e.g. "14:00" or "2:00 PM"',
  })
  preferredTime: string;
}
