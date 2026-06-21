import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymobService } from './paymob.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { MainRequest, RequestSchema } from '../request/schemas/request.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { PaymentScheduler } from './payment.scheduler';
import { Invoice, InvoiceSchema } from 'src/invoice/schemas/invoice.schema';
import { InvoiceModule } from '../invoice/invoice.module';
import { MailModule } from '../mail/mail.module';

import { NotificationModule } from 'src/notification/notification.module';
import { WalletModule } from 'src/wallet/wallet.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: MainRequest.name, schema: RequestSchema },
      { name: User.name, schema: UserSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
    InvoiceModule,
    MailModule,
    NotificationModule,
    WalletModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymobService, PaymentScheduler],
  exports: [PaymentService],
})
export class PaymentModule {}
