import { IsNumber, IsString, Min, IsNotEmpty } from 'class-validator';

export class CompleteRequestDto {
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsString()
  @IsNotEmpty()
  completionNote: string;
}