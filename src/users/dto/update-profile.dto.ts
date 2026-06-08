import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../schemas/user.schema';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'Ahmed Mohamed',
    minLength: 3,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Phone number (any international format)',
    example: '20123456789',
    pattern: '^[0-9+\\-\\s()]+$',
  })
  @IsOptional()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Governorate or state name',
    example: 'Cairo',
  })
  @IsOptional()
  @IsString()
  governorate?: string;

  @ApiPropertyOptional({
    description: 'City name',
    example: 'Giza',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'User gender',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
