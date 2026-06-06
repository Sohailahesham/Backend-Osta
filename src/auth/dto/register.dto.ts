import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Gender } from '../../users/schemas/user.schema';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  fullName: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  confirmPassword: string;

  @IsNotEmpty()
  @Matches(/^[0-9]{11}$/, { message: 'Phone must be 11 digits' })
  phone: string;

  @IsNotEmpty()
  @IsString()
  governorate: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsEnum(Gender, { message: 'Gender must be male or female' })
  gender: Gender;
}
