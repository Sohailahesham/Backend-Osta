import { IsArray, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWorkInfoDto {
  @ApiProperty({
    description: 'Job title / professional headline',
    example: 'فني تكييف وتبريد أول',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string;

  @ApiProperty({
    description:
      'Array of MongoDB IDs of selected services — must belong to the technician\'s existing category',
    example: ['60d5ec49c1234567890abc13', '60d5ec49c1234567890abc14'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true, message: 'Invalid service id' })
  serviceIds?: string[];
}