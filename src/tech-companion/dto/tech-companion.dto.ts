import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TechCompanionDto {
  @ApiProperty({ example: 'What is my schedule for today?' })
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  conversationId?: string;
}