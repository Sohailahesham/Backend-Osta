import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatMessageDto {
  role!: 'user' | 'assistant';
  content!: string;
}

export class ChatDto {
  @ApiProperty({
    description: 'User message to send to the AI assistant',
    example: 'التكييف مش بيبرد كويس',
  })
  @IsString()
  message!: string;

  @ApiPropertyOptional({
    description: 'Conversation ID for multi-turn memory',
    example: 'conv_abc123',
  })
  @IsOptional()
  @IsString()
  conversationId?: string;

  @ApiPropertyOptional({
    description: 'Previous conversation history',
    type: [ChatMessageDto],
  })
  @IsOptional()
  @IsArray()
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}