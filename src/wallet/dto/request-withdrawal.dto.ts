

import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { WithdrawalMethod } from '../schemas/withdrawal.schema';

export class RequestWithdrawalDto {
  @IsNumber()
  @Min(50)
  amount: number;

  @IsEnum(WithdrawalMethod)
  method: WithdrawalMethod;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;
}

