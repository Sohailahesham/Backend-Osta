import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsMongoId,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsUppercase,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PriceRangeDto {
  @ApiProperty({
    description: 'Minimum price for the service',
    example: 100,
    minimum: 0,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  min!: number;

  @ApiProperty({
    description: 'Maximum price for the service',
    example: 500,
    minimum: 0,
    type: Number,
  })
  @IsNumber()
  @Min(0)
  max!: number;
}

export class FixingStepsDto {
  @ApiPropertyOptional({
    description: 'What is included in the service',
    example: ['Labor', 'Basic materials', 'Installation'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includes?: string[];

  @ApiPropertyOptional({
    description: 'What is not included in the service',
    example: ['Premium materials', 'Extended warranty'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  doesNotInclude?: string[];
}
/***************************will be separated ********* */
export class AddCommentDto {
  @ApiPropertyOptional({
    description: 'MongoDB ID of the user leaving comment (auto-filled)',
    example: '60d5ec49c1234567890abc12',
    format: 'mongodb-id',
  })
  @IsMongoId()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Name of the user leaving comment (auto-filled)',
    example: 'Ahmed Mohamed',
  })
  @IsString()
  @IsOptional()
  userName?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL of the user (auto-filled)',
    example: 'https://example.com/avatar.jpg',
  })
  @IsString()
  @IsOptional()
  userAvatar?: string;

  @ApiProperty({
    description: 'Rating score (1-5 stars)',
    example: 4,
    minimum: 1,
    maximum: 5,
    type: Number,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({
    description: 'Comment text',
    example: 'Great service, very professional',
  })
  @IsString()
  @IsNotEmpty()
  text!: string;
}
/********************************************************* */

export class CreateServiceDto {
  @ApiProperty({
    description: 'Unique service key (must be uppercase)',
    example: 'PIPE_FIXING',
  })
  @IsString()
  @IsNotEmpty()
  @IsUppercase()
  key!: string;

  @ApiProperty({
    description: 'Service display name',
    example: 'Pipe Fixing and Installation',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'Detailed service description',
    example: 'Professional pipe fixing, replacement and installation service',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Service image URL',
    example: 'https://example.com/pipe-fixing.jpg',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'MongoDB ID of the category this service belongs to',
    example: '60d5ec49c1234567890abc12',
    format: 'mongodb-id',
  })
  @IsMongoId()
  category!: string;

  @ApiProperty({
    description: 'Price range for this service',
    type: PriceRangeDto,
  })
  @ValidateNested()
  @Type(() => PriceRangeDto)
  priceRange!: PriceRangeDto;

  @ApiPropertyOptional({
    description: 'Service details including what is included and excluded',
    type: FixingStepsDto,
  })
  @ValidateNested()
  @Type(() => FixingStepsDto)
  @IsOptional()
  fixingSteps?: FixingStepsDto;

  @ApiPropertyOptional({
    description: 'Whether this service is active and available',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
