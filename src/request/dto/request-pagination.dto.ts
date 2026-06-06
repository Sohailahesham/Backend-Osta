
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequestStatus } from '../enums/request-status.enum';

export class RequestPaginationDto extends PaginationDto {
  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus;
}