import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../users/schemas/user.schema';

export class RegisterDto {
  @ApiProperty({
    description: 'User full name',
    example: 'Ahmed Mohamed',
    minLength: 3,
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  fullName: string;

  @ApiProperty({
    description: 'Unique email address',
    example: 'client@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Account password (minimum 8 characters)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Password confirmation (must match password field)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({
    description: 'Phone number (11 digits for Egypt)',
    example: '20123456789',
    pattern: '^[0-9]{11}$',
  })
  @IsNotEmpty()
  @Matches(/^[0-9]{11}$/, { message: 'Phone must be 11 digits' })
  phone: string;

  @ApiProperty({
    description: 'Governorate/State name',
    example: 'Cairo',
  })
  @IsNotEmpty()
  @IsString()
  governorate: string;

  @ApiProperty({
    description: 'City name',
    example: 'Giza',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'User gender',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsNotEmpty()
  @IsEnum(Gender, { message: 'Gender must be male or female' })
  gender: Gender;
}
