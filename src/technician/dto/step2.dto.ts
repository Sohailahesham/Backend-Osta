import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { Specialization } from '../../users/schemas/user.schema';

export class Step2Dto {
  @IsArray()
  @IsNotEmpty()
  @IsEnum(Specialization, { each: true, message: 'Invalid specialization' })
  specializations: Specialization[];
}