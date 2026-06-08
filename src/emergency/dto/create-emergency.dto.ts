import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmergencyType } from '../schemas/emergency.schema';

export class CreateEmergencyDto {
  @ApiProperty({
    description: 'Type of emergency contact',
    enum: EmergencyType,
    example: EmergencyType.URGENT,
  })
  @IsEnum(EmergencyType, {
    message: `type must be one of: ${Object.values(EmergencyType).join(', ')}`,
  })
  type: EmergencyType;

  @ApiProperty({
    description: 'Name of the emergency service',
    example: 'Red Crescent Hospital',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Phone number for the emergency service',
    example: '20123456789',
    pattern: '^[0-9+\\-\\s()]+$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
  phone: string;

  @ApiPropertyOptional({
    description: 'Description of the emergency service',
    example: 'Main hospital in Cairo',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Icon URL for the emergency type',
    example: 'https://example.com/urgent-icon.png',
  })
  @IsString()
  @IsOptional()
  icon?: string;
}
