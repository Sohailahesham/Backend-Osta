import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { MainRequest, RequestSchema } from '../request/schemas/request.schema';
import { MailModule } from '../mail/mail.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: MainRequest.name, schema: RequestSchema },
    ]),
    MailModule,
    WalletModule
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService ],
  exports: [InvoiceService],
})
export class InvoiceModule {}