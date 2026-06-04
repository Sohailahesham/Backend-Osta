import { IsMongoId, IsArray, IsNotEmpty } from 'class-validator';

export class Step2Dto {
  @IsNotEmpty()
  @IsMongoId({ message: 'Invalid category id' })
  categoryId: string;

  @IsArray()
  @IsMongoId({ each: true, message: 'Invalid service id' })
  serviceIds: string[];
}