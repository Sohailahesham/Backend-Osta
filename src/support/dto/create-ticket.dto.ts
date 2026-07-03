import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'تأخر وصول الفني لموعد الصيانة' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @ApiProperty({
    example:
      'كان الموعد محدد الساعة 10 صباحاً ولم يصل الفني حتى الآن. أرجو المتابعة وإبلاغي بالموعد الجديد.',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  description: string;
}
