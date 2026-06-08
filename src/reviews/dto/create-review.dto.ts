import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'MongoDB ID of the completed service request',
    example: '60d5ec49c1234567890abc12',
    format: 'mongodb-id',
  })
  @IsMongoId()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({
    description: 'Rating score (1-5 stars)',
    example: 5,
    minimum: 1,
    maximum: 5,
    type: Number,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Optional comment about the service',
    example: 'Excellent service, very professional and punctual',
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
