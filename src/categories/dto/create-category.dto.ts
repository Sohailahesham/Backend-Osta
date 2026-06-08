import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUppercase,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Unique category key (must be uppercase)',
    example: 'PLUMBING',
  })
  @IsString()
  @IsNotEmpty()
  @IsUppercase()
  key!: string;

  @ApiProperty({
    description: 'Category display name',
    example: 'Plumbing Services',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Detailed description of the category',
    example:
      'All plumbing related services including pipe fixing, installation, etc.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({
    description: 'Category image URL or file path',
    example: 'https://example.com/plumbing.jpg',
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    description: 'Whether the category is active and visible',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
