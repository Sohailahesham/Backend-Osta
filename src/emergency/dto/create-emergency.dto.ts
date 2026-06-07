import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { EmergencyType } from '../schemas/emergency.schema';

export class CreateEmergencyDto {
  @IsEnum(EmergencyType, {
    message: `type must be one of: ${Object.values(EmergencyType).join(', ')}`,
  })
  type: EmergencyType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
  phone: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
