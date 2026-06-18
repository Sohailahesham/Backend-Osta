import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CompleteRequestDto {
  @IsNumber()
  @Min(0)
  servicePrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  extraMaterialsPrice?: number;

  @IsString()
  @IsNotEmpty()
  completionNote: string;
}