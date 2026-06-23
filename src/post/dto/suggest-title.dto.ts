import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SuggestTitleDto {
  @ApiProperty({ example: 'عندي تسريب في الحمام تحت الحوض بجانب المرحاض' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'الوصف قصير جداً' })
  @MaxLength(500, { message: 'الوصف طويل جداً' })
  description: string;
}