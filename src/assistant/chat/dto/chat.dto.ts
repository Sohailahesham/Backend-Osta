import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatDto {
  @ApiProperty({
    description: 'User message to send to the AI assistant',
    example: 'How can I find a plumber near me?',
  })
  @IsString()
  message!: string;
}
