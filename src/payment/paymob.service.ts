import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaymobService {
  private readonly secretKey = process.env.PAYMOB_SECRET_KEY;
  private readonly publicKey = process.env.PAYMOB_PUBLIC_KEY;
  private readonly hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  private readonly cardIntegrationId = process.env.PAYMOB_INTEGRATION_ID_CARD;
  private readonly walletIntegrationId =
    process.env.PAYMOB_INTEGRATION_ID_WALLET;
  private readonly instapayIntegrationId =
    process.env.PAYMOB_INTEGRATION_ID_INSTAPAY;

  // ─── Create Intention (unified) ───────────────────────────────────────────
  private async createIntention(
    amount: number,
    user: { email: string; fullName: string; phone: string },
    integrationIds: number[],
    requestId: string,
  ): Promise<{ paymentUrl: string; orderId: string }> {
    const res = await axios.post(
      'https://accept.paymob.com/v1/intention/',
      {
        amount: amount * 100,
        currency: 'EGP',
        payment_methods: integrationIds,
        items: [],
        billing_data: {
          first_name: user.fullName.split(' ')[0],
          last_name: user.fullName.split(' ')[1] ?? 'N/A',
          email: user.email,
          phone_number: user.phone ?? 'N/A',
        },
        // redirection_url: `http://localhost:3001/client/tracking/${requestId}`,
        redirection_url: `http://localhost:3001/client/orders`,
      },
      {
        headers: {
          Authorization: `Token ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return {
      paymentUrl: `https://accept.paymob.com/unifiedcheckout/?publicKey=${this.publicKey}&clientSecret=${res.data.client_secret}`,
      orderId: res.data.intention_order_id.toString(),
    };
  }

  // ─── Card Payment ─────────────────────────────────────────────────────────
  async getPaymentUrl(
    amount: number,
    user: { email: string; fullName: string; phone: string },
    requestId: string,
  ): Promise<{ paymentUrl: string; orderId: string }> {
    return this.createIntention(
      amount,
      user,
      [
        parseInt(this.cardIntegrationId!),
        parseInt(this.walletIntegrationId!),
        parseInt(this.instapayIntegrationId!),
      ],
      requestId,
    );
  }

  // ─── Verify HMAC ──────────────────────────────────────────────────────────
  verifyHmac(data: any, hmac: string): boolean {
    const crypto = require('crypto');
    const obj = data.obj ?? data;

    const values = [
      obj.amount_cents,
      obj.created_at,
      obj.currency,
      obj.error_occured,
      obj.has_parent_transaction,
      obj.id,
      obj.integration_id,
      obj.is_3d_secure,
      obj.is_auth,
      obj.is_capture,
      obj.is_refunded,
      obj.is_standalone_payment,
      obj.is_voided,
      obj.order?.id,
      obj.owner,
      obj.pending,
      obj.source_data?.pan,
      obj.source_data?.sub_type,
      obj.source_data?.type,
      obj.success,
    ];

    const string = values.join('');
    const hash = crypto
      .createHmac('sha512', this.hmacSecret!)
      .update(string)
      .digest('hex');

    return hash === hmac;
  }

  private async getAuthToken(): Promise<string> {
    const res = await axios.post('https://accept.paymob.com/api/auth/tokens', {
      api_key: process.env.PAYMOB_API_KEY,
    });
    return res.data.token;
  }

  async refundPayment(transactionId: string, amount: number): Promise<void> {
    const res = await axios.post(
      `https://accept.paymob.com/api/acceptance/void_refund/refund`,
      {
        auth_token: await this.getAuthToken(),
        transaction_id: transactionId,
        amount_cents: amount * 100,
      },
    );

    if (!res.data.success) {
      throw new BadRequestException(res.data.message ?? 'Refund failed');
    }
  }
}