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
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CoordinatesDto {
  @ApiProperty({ example: 30.0444, type: Number })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 31.2357, type: Number })
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
  @MinLength(10, { message: 'Full address must be at least 10 characters' })
  @MaxLength(200, { message: 'Full address must not exceed 200 characters' })
  fullAddress: string;

  @ApiProperty({
    description: 'area',
    example: 'elgam3a',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'District must be at least 3 characters' })
  @MaxLength(100, { message: 'District must not exceed 100 characters' })
  district: string;

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
  @IsNotEmpty()
  address: AddressDto;

  @ApiProperty({
    description: 'Preferred date for service (ISO format)',
    example: '2024-02-15',
    format: 'date',
  })
  @IsDateString()
  preferredDate: string;

  @ApiProperty({
    description: 'Preferred time for service',
    example: '14:00',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d(\s?(AM|PM))?$/i, {
    message: 'preferredTime must be a valid time e.g. "14:00" or "2:00 PM"',
  })
  preferredTime: string;

  @ApiPropertyOptional({
    description: 'Additional Notes',
    example: 'i need more lamps',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}