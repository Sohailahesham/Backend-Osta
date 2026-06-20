import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { NotificationService } from './notification.service';

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /** GET /notifications?page=1&limit=20 */
  @Get()
  findAll(
    @Request() req: AuthRequest,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.notificationService.findByUser(req.user.userId, +page, +limit);
  }

  /** GET /notifications/unread-count */
  @Get('unread-count')
  unreadCount(@Request() req: AuthRequest) {
    return this.notificationService.countUnread(req.user.userId);
  }

  /** PATCH /notifications/read-all – mark all as read */
  @Patch('read-all')
  markAllRead(@Request() req: AuthRequest) {
    return this.notificationService.markAllRead(req.user.userId);
  }

  /** PATCH /notifications/:id/read  – mark one as read */
  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.notificationService.markRead(id);
  }
}