import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { User, UserSchema } from '../users/schemas/user.schema'; 
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationController } from './notification.controller';
import { VerificationReminderService } from './verification-reminder.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema }, 
    ]),
    ScheduleModule.forRoot(), 
  ],
  providers: [
    NotificationService,
    NotificationGateway,
    VerificationReminderService,
  ],
  controllers: [NotificationController ],
 
  exports: [NotificationService],
})
export class NotificationModule {}
