import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { EmergencyType } from '../schemas/emergency.schema';

export class EmergencyQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(EmergencyType, {
    message: `type must be one of: ${Object.values(EmergencyType).join(', ')}`,
  })
  type?: EmergencyType;
}
