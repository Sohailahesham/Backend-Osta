import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MainRequest, RequestSchema } from './schemas/request.schema';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { AuthModule } from '../auth/auth.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { PaymentModule } from '../payment/payment.module';
import { ChatModule } from 'src/chat/chat.module';
import {
  Technician,
  TechnicianSchema,
} from 'src/technician/schemas/technician.schema';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MainRequest.name, schema: RequestSchema },
      { name: Technician.name, schema: TechnicianSchema },
      
    ]),
    AuthModule, // provides JwtStrategy + PassportModule → enables AuthGuard('jwt')
    PaymentModule,
    InvoiceModule,
    ChatModule,
    NotificationModule
  ],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService], // TechnicianModule can inject RequestService later
})
export class RequestModule {}
