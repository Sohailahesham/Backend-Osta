import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { EmergencyType } from '../schemas/emergency.schema';

export class EmergencyQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by emergency type',
    enum: EmergencyType,
    example: EmergencyType.URGENT,
  })
  @IsOptional()
  @IsEnum(EmergencyType, {
    message: `type must be one of: ${Object.values(EmergencyType).join(', ')}`,
  })
  type?: EmergencyType;
}
