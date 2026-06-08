import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'Updated rating score (1-5 stars)',
    example: 4,
    minimum: 1,
    maximum: 5,
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Updated review comment',
    example: 'Very good service',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
