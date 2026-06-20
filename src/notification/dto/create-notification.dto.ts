import { NotificationType } from '../enums/notification-type.enum';

export class CreateNotificationDto {
  recipientId: string;
  title: string;
  body: string;
  type: NotificationType;
  requestId?: string;
  metadata?: Record<string, unknown>;
}
