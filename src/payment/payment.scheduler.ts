import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
} from './schemas/payment.schema';
import {
  MainRequest,
  RequestDocument,
} from '../request/schemas/request.schema';
import { DepositStatus } from 'src/request/enums/request-status.enum';

@Injectable()
export class PaymentScheduler {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(MainRequest.name) private requestModel: Model<RequestDocument>,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async expirePendingPayments() {
    // const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const thirtyMinutesAgo = new Date(Date.now() - 1 * 60 * 1000);

    const expiredPayments = await this.paymentModel.find({
      status: PaymentStatus.PENDING,
      createdAt: { $lt: thirtyMinutesAgo },
    });

    for (const payment of expiredPayments) {
      await this.paymentModel.findByIdAndUpdate(payment._id, {
        status: PaymentStatus.FAILED,
      });
      await this.requestModel.updateOne(
    { 
      _id: payment.requestId, 
      depositStatus: DepositStatus.PENDING,
    },
    { depositStatus: DepositStatus.UNPAID },
  );
    }

    console.log(`Expired ${expiredPayments.length} pending payments`);
  }
}
