import { IsMongoId, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Step2Dto {
  @ApiProperty({
    description: 'MongoDB ID of the service category',
    example: '60d5ec49c1234567890abc12',
    format: 'mongodb-id',
  })
  @IsNotEmpty()
  @IsMongoId({ message: 'Invalid category id' })
  categoryId: string;

  @ApiProperty({
    description: 'Array of MongoDB IDs of selected services',
    example: ['60d5ec49c1234567890abc13', '60d5ec49c1234567890abc14'],
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true, message: 'Invalid service id' })
  serviceIds: string[];
}
