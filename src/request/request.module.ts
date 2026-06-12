import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MainRequest, RequestSchema } from './schemas/request.schema';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { AuthModule } from '../auth/auth.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { PaymentModule } from '../payment/payment.module';
 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MainRequest.name, schema: RequestSchema },
    ]),
    AuthModule, // provides JwtStrategy + PassportModule → enables AuthGuard('jwt')
     InvoiceModule,
     PaymentModule,
  ],
  controllers: [RequestController],
  providers: [RequestService],
  exports: [RequestService], // TechnicianModule can inject RequestService later
})
export class RequestModule {}