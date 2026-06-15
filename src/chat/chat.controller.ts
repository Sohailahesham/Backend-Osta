import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

@ApiTags('Chat')
@ApiBearerAuth('JWT')
@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Get message history for a request' })
  @Get(':requestId/messages')
  getMessages(
    @Param('requestId', ParseMongoIdPipe) requestId: string,
    @Req() req,
  ) {
    return this.chatService.getRequestMessages(
      requestId,
      req.user.userId,
      req.user.role,
    );
  }

  @ApiOperation({ summary: 'Get unread count for a request' })
  @Get(':requestId/unread')
  async getUnreadCount(
    @Param('requestId', ParseMongoIdPipe) requestId: string,
    @Req() req,
  ) {
    const roomId = `room_${requestId}`;
    const count = await this.chatService.getUnreadCount(
      roomId,
      req.user.userId,
    );
    return { message: 'Unread count retrieved', data: { count } };
  }
}
