import { IsEnum, IsOptional, IsMongoId } from 'class-validator';
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

  @ApiPropertyOptional({
    description: 'Filter requests by category ID',
    example: '60d5ec49c1234567890abc12',
  })
  @IsMongoId()
  @IsOptional()
  categoryId?: string;
}
