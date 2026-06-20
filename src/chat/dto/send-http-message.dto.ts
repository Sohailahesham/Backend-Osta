import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SendHttpMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  content?: string;
}
