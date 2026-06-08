import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgetPasswordDto {
  @ApiProperty({
    description: 'Registered email address to receive OTP',
    example: 'client@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;
}
