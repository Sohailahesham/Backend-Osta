import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '../enums/request-status.enum';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'New status for the request',
    enum: RequestStatus,
    example: RequestStatus.IN_PROGRESS,
  })
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
