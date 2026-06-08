import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
  PaymentType,
} from './schemas/payment.schema';
import {
  MainRequest,
  RequestDocument,
} from '../request/schemas/request.schema';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { PaymobService } from './paymob.service';
import {
  DepositStatus,
  RequestStatus,
} from 'src/request/enums/request-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(MainRequest.name) private requestModel: Model<RequestDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private paymobService: PaymobService,
  ) {}

  async payDeposit(
    requestId: string,
    userId: string,
    method: PaymentMethod = PaymentMethod.CARD,
  ) {
    const request = await this.requestModel.findById(requestId);
    if (!request) throw new NotFoundException('Request not found');

    if (request.userId.toString() !== userId)
      throw new BadRequestException('Not authorized');

    if (request.status !== RequestStatus.ACCEPTED)
      throw new BadRequestException(
        'Request must be accepted by technician first',
      );

    if (request.depositStatus !== DepositStatus.UNPAID)
      throw new BadRequestException('Deposit already paid or pending');

    if (request.isFullyPaid)
      throw new BadRequestException('Request is already fully paid');

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== UserRole.CLIENT)
      throw new BadRequestException('Only clients can pay deposit');

    const payment = await this.paymentModel.create({
      requestId: new Types.ObjectId(requestId),
      userId: new Types.ObjectId(userId),
      amount: request.depositAmount,
      type: PaymentType.DEPOSIT,
      status: PaymentStatus.PENDING,
    });

    const { paymentUrl, orderId } =
      method === PaymentMethod.WALLET
        ? await this.paymobService.getWalletPaymentUrl(request.depositAmount, {
            email: user.email,
            fullName: user.fullName,
            phone: user.phone ?? 'N/A',
          })
        : await this.paymobService.getPaymentUrl(
            request.depositAmount,
            {
              email: user.email,
              fullName: user.fullName,
              phone: user.phone ?? 'N/A',
            },
            method,
          );

    await this.paymentModel.findByIdAndUpdate(payment._id, {
      paymobOrderId: orderId,
    });
    await this.requestModel.findByIdAndUpdate(requestId, {
      depositStatus: DepositStatus.PENDING,
      paymentId: payment._id,
    });

    return { message: 'Payment initiated', paymentUrl, paymentId: payment._id };
  }

  async handleWebhook(body: any, hmac: string) {

    const isValid = this.paymobService.verifyHmac(body, hmac);
    if (!isValid) throw new BadRequestException('Invalid HMAC');

    const obj = body.obj ?? body;
    const { success, order, id: transactionId } = obj;
    const orderId = order?.id?.toString();

    const payment = await this.paymentModel.findOne({ paymobOrderId: orderId });
    if (!payment) return { message: 'Payment not found' };

    if (success) {
      await this.paymentModel.findByIdAndUpdate(payment._id, {
        status: PaymentStatus.PAID,
        paymobTransactionId: transactionId.toString(),
        paidAt: new Date(),
      });

      //  deposit
      if (payment.type === PaymentType.DEPOSIT) {
        await this.requestModel.findByIdAndUpdate(payment.requestId, {
          depositStatus: DepositStatus.PAID,
          status: RequestStatus.IN_PROGRESS,
        });
      }

      //  remaining
      if (payment.type === PaymentType.REMAINING) {
        await this.requestModel.findByIdAndUpdate(payment.requestId, {
          status: RequestStatus.COMPLETED,
          isFullyPaid: true,
        });
      }
    }
    return { message: 'Webhook handled' };
  }

  async payRemaining(
    requestId: string,
    userId: string,
    method: PaymentMethod = PaymentMethod.CARD,
  ) {
    const request = await this.requestModel.findById(requestId);
    if (!request) throw new NotFoundException('Request not found');

    if (request.userId.toString() !== userId)
      throw new BadRequestException('Not authorized');

    if (request.status !== RequestStatus.COMPLETED)
      throw new BadRequestException('Request must be completed first');

    if (request.isFullyPaid)
      throw new BadRequestException('Already fully paid');

    if (request.depositStatus === DepositStatus.UNPAID)
      throw new BadRequestException('Deposit must be paid first');

    if (!request.totalPrice || request.totalPrice === 0)
      throw new BadRequestException('Total price not set yet');
    

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.role !== UserRole.CLIENT)
      throw new BadRequestException('Only clients can pay');

    const remainingAmount = request.totalPrice - request.depositAmount;

    if (remainingAmount <= 0)
      throw new BadRequestException('No remaining amount to pay');

    const payment = await this.paymentModel.create({
      requestId: new Types.ObjectId(requestId),
      userId: new Types.ObjectId(userId),
      amount: remainingAmount,
      type: PaymentType.REMAINING,
      status: PaymentStatus.PENDING,
    });

    const { paymentUrl, orderId } =
      method === PaymentMethod.WALLET
        ? await this.paymobService.getWalletPaymentUrl(remainingAmount, {
            email: user.email,
            fullName: user.fullName,
            phone: user.phone ?? 'N/A',
          })
        : await this.paymobService.getPaymentUrl(
            remainingAmount,
            {
              email: user.email,
              fullName: user.fullName,
              phone: user.phone ?? 'N/A',
            },
            method,
          );

    await this.paymentModel.findByIdAndUpdate(payment._id, {
      paymobOrderId: orderId,
    });

    return {
      message: 'Payment initiated',
      data: {
        paymentUrl,
        paymentId: payment._id,
        remainingAmount,
      },
    };
  }
}
