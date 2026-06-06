import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CancelRequestDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
