import {
  Controller,
  Post,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';
import { PaymentMethod } from './enums/payment-method.enum';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('deposit/:requestId/card')
  @UseGuards(AuthGuard('jwt'))
  payDepositCard(@Param('requestId') requestId: string, @Req() req) {
    return this.paymentService.payDeposit(
      requestId,
      req.user.userId,
      PaymentMethod.CARD,
    );
  }

  @Post('deposit/:requestId/wallet')
  @UseGuards(AuthGuard('jwt'))
  payDepositWallet(@Param('requestId') requestId: string, @Req() req) {
    return this.paymentService.payDeposit(
      requestId,
      req.user.userId,
      PaymentMethod.WALLET,
    );
  }
  @Post('remaining/:requestId')
  @UseGuards(AuthGuard('jwt'))
  payRemaining(
    @Param('requestId') requestId: string,
    @Query('method') method: PaymentMethod = PaymentMethod.CARD,
    @Req() req,
  ) {
    return this.paymentService.payRemaining(requestId, req.user.userId, method);
  }

  @Post('webhook')
  async handleWebhook(@Req() req) {
    let body = req.body;
    if (Buffer.isBuffer(body)) {
      body = JSON.parse(body.toString('utf8'));
    }
    const hmac = req.query?.hmac;
    return this.paymentService.handleWebhook(body, hmac);
  }
}
