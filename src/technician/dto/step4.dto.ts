import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Step4Dto {
  @ApiProperty({
    description: 'List of service areas where technician can work',
    example: ['Cairo', 'Giza', 'Helwan'],
    type: [String],
  })
  @ValidateIf((dto: Step4Dto) => dto.canWorkOutsideArea === false)
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty({
    message:
      'serviceAreas must include at least one area when canWorkOutsideArea is false',
  })
  serviceAreas: string[];

  @ApiProperty({
    description: 'Can the technician work outside their service areas',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  canWorkOutsideArea: boolean;
}