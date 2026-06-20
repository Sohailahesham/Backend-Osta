import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { NotificationService } from './notification.service';
import { NotificationType } from './enums/notification-type.enum';


const REMINDER_MESSAGES: { title: string; body: string }[] = [
  {
    title: 'وثّق حسابك وابدأ بثقة ✅',
    body: 'لسه حسابك مش متفعّل! وثّق هويتك دلوقتي عشان تقدر تستخدم المنصة بكامل مميزاتها وتكسب ثقة العملاء والفنيين.',
  },
  {
    title: 'خطوة وحدة تفصلك عن التفعيل الكامل 🔐',
    body: 'حسابك لسه مش موثّق. التوثيق بياخد دقايق بس وبيفتحلك كل خدمات المنصة من غير أي قيود.',
  },
  {
    title: 'فعّل حسابك وابدأ تستفيد أكتر 🚀',
    body: 'الحسابات الموثّقة بتحصل على ثقة أكبر وفرص أكتر. وثّق حسابك الآن ولا تفوّت أي فرصة.',
  },
  {
    title: 'التوثيق = أمان وثقة 🛡️',
    body: 'باقي خطوة بسيطة لتوثيق حسابك. كل ما توثّق بدري كل ما قدرت تستخدم المنصة من غير أي تعطيل.',
  },
];

@Injectable()
export class VerificationReminderService {
  private readonly logger = new Logger(VerificationReminderService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Runs once every day at 10:00 AM server time.
   * Sends a motivating reminder to every user whose account is not verified yet.
   *
   * To avoid spamming: skip a user if they already have an UNREAD
   * VERIFY_ACCOUNT_REMINDER notification sitting in their inbox.
   * Once they read it (or it gets marked read), they become eligible again
   * on the next run.
   */
@Cron(CronExpression.EVERY_DAY_AT_10AM, {
  name: 'verify-account-daily-reminder',
  timeZone: 'Africa/Cairo',
})
async sendDailyVerificationReminders(): Promise<void> {
  this.logger.log('Running daily verification reminder job (cron trigger)...');
  await this.runReminderJob();
}

// ↓ ADD THIS NEW METHOD — same body as before, just extracted so it can
// also be called manually from the debug controller
async runReminderJob(): Promise<{ sent: number; totalUnverified: number }> {
  const unverifiedUsers = await this.userModel
    .find({ isVerified: false })
    .select('_id fullName role')
    .lean();

  if (unverifiedUsers.length === 0) {
    this.logger.log('No unverified users found. Skipping.');
    return { sent: 0, totalUnverified: 0 };
  }

  let sentCount = 0;

  for (const user of unverifiedUsers) {
    const alreadyHasUnread = await this.notificationService.hasUnreadOfType(
      user._id.toString(),
      NotificationType.VERIFY_ACCOUNT_REMINDER,
    );

    if (alreadyHasUnread) continue;

    const message =
      REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];

    await this.notificationService.send({
      recipientId: user._id.toString(),
      type: NotificationType.VERIFY_ACCOUNT_REMINDER,
      title: message.title,
      body: message.body,
      metadata: { role: user.role },
    });

    sentCount++;
  }

  this.logger.log(
    `Verification reminder job finished. Sent ${sentCount}/${unverifiedUsers.length} reminders.`,
  );

  return { sent: sentCount, totalUnverified: unverifiedUsers.length };
}
}