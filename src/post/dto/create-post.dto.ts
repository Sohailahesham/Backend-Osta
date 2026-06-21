import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AddressDto {
  @ApiProperty({ example: '123 شارع التحرير' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  fullAddress: string;

  @ApiProperty({ example: 'المعادي' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  district: string;
}

export class CreatePostDto {
  @ApiProperty({ example: '60d5ec49c1234567890abc12' })
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 'عندي تسريب في الحمام' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  address: AddressDto;

  @ApiProperty({ example: '2026-06-15' })
  @IsDateString()
  preferredDate: string;

  @ApiProperty({ example: '14:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?\d|2[0-3]):[0-5]\d(\s?(AM|PM))?$/i, {
    message: 'preferredTime must be a valid time e.g. "14:00" or "2:00 PM"',
  })
  preferredTime: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isEmergency?: boolean;


  @ApiPropertyOptional({ example: 200 })
  @IsNumber()
  @Min(50)
  @Transform(({ value }) => {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
})
  @IsOptional()
  budget?: number;

  @ApiProperty({ example: 'إصلاح تسريب مياه' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  title: string;
}
