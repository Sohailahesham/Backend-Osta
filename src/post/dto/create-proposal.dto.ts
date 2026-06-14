import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProposalDto {
  @ApiProperty({ example: 300 })
  @IsNumber()
  @Min(1)
  price: number;

  @ApiProperty({ example: '2 hours' })
  @IsString()
  @IsNotEmpty()
  estimatedTime: string;

  @ApiPropertyOptional({ example: 'هعمل كشف وأصلح التسريب' })
  @IsString()
  @IsOptional()
  description?: string;
}