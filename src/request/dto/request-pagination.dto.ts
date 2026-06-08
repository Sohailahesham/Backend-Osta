import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequestStatus } from '../enums/request-status.enum';

export class RequestPaginationDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter requests by status',
    enum: RequestStatus,
    example: RequestStatus.PENDING,
  })
  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus;
}
