import { IsArray, IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Step4Dto {
  @ApiProperty({
    description: 'List of service areas where technician can work',
    example: ['Cairo', 'Giza', 'Helwan'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  serviceAreas: string[];

  @ApiProperty({
    description: 'Can the technician work outside their service areas',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  canWorkOutsideArea: boolean;
}
