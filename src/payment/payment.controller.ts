import { Controller, Post, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('deposit/:requestId')
@UseGuards(AuthGuard('jwt'))
payDeposit(@Param('requestId') requestId: string, @Req() req) {
  return this.paymentService.payDeposit(requestId, req.user.userId);
}


  @Post('remaining/:requestId')
  @UseGuards(AuthGuard('jwt'))
  payRemaining(
    @Param('requestId') requestId: string,
    @Req() req,
  ) {
    return this.paymentService.payRemaining(requestId, req.user.userId);
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
