import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PaymentMethod } from './enums/payment-method.enum';

@Injectable()
export class PaymobService {
  private readonly apiKey = process.env.PAYMOB_API_KEY;
  private readonly integrationId = process.env.PAYMOB_INTEGRATION_ID_CARD;
  private readonly iframeId = process.env.PAYMOB_IFRAME_ID;
  private readonly walletIntegrationId =
    process.env.PAYMOB_INTEGRATION_ID_WALLET;

  // Step 1: Auth
  private async getAuthToken(): Promise<string> {
    const res = await axios.post('https://accept.paymob.com/api/auth/tokens', {
      api_key: this.apiKey,
    });
    return res.data.token;
  }

  // Step 2: Create Order
  private async createOrder(token: string, amount: number): Promise<string> {
    const res = await axios.post(
      'https://accept.paymob.com/api/ecommerce/orders',
      {
        auth_token: token,
        delivery_needed: false,
        amount_cents: amount * 100,
        currency: 'EGP',
        items: [],
      },
    );
    return res.data.id;
  }

  // Step 3: Payment Key
  private async getPaymentKey(
    token: string,
    orderId: string,
    amount: number,
    user: { email: string; fullName: string; phone: string },
    integrationId: string,
  ): Promise<string> {
    const res = await axios.post(
      'https://accept.paymob.com/api/acceptance/payment_keys',
      {
        auth_token: token,
        amount_cents: amount * 100,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          email: user.email,
          first_name: user.fullName.split(' ')[0],
          last_name: user.fullName.split(' ')[1] ?? 'N/A',
          phone_number: user.phone ?? 'N/A',
          apartment: 'N/A',
          floor: 'N/A',
          street: 'N/A',
          building: 'N/A',
          shipping_method: 'N/A',
          postal_code: 'N/A',
          city: 'N/A',
          country: 'EG',
          state: 'N/A',
        },
        currency: 'EGP',
        integration_id: integrationId,
      },
    );
    return res.data.token;
  }

  // Main: Get Payment URL
  async getPaymentUrl(
    amount: number,
    user: { email: string; fullName: string; phone: string },
    method: PaymentMethod = PaymentMethod.CARD,
  ): Promise<{ paymentUrl: string; orderId: string }> {
    const token = await this.getAuthToken();
    const orderId = await this.createOrder(token, amount);

    const integrationId =
      method === PaymentMethod.WALLET
        ? this.walletIntegrationId
        : this.integrationId;

    const paymentKey = await this.getPaymentKey(
      token,
      orderId,
      amount,
      user,
      integrationId!,
    );

    return {
      paymentUrl: `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`,
      orderId: orderId.toString(),
    };
  }

  // Verify HMAC
  verifyHmac(data: any, hmac: string): boolean {
    const crypto = require('crypto');
    const secret = process.env.PAYMOB_HMAC_SECRET!;
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
      .createHmac('sha512', secret)
      .update(string)
      .digest('hex');

    return hash === hmac;
  }

  async getWalletPaymentUrl(
  amount: number,
  user: { email: string; fullName: string; phone: string },
): Promise<{ paymentUrl: string; orderId: string }> {
  const token = await this.getAuthToken();
  const orderId = await this.createOrder(token, amount);
  const paymentKey = await this.getPaymentKey(
    token,
    orderId,
    amount,
    user,
    this.walletIntegrationId!,
  );

  const res = await axios.post(
    'https://accept.paymob.com/api/acceptance/payments/pay',
    {
      source: {
        identifier: user.phone, 
        subtype: 'WALLET',
      },
      payment_token: paymentKey,
    },
  );

  return {
     paymentUrl: res.data.redirection_url,
    orderId: orderId.toString(),
  };
}
}
