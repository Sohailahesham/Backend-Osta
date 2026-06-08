import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymobService } from './paymob.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { MainRequest, RequestSchema } from '../request/schemas/request.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: MainRequest.name, schema: RequestSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymobService],
  exports: [PaymentService],
})
export class PaymentModule {}