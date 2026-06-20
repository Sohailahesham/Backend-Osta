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
import { Invoice, InvoiceDocument } from 'src/invoice/schemas/invoice.schema';
import { InvoiceService } from 'src/invoice/invoice.service';
import { MailService } from 'src/mail/mail.service';

// ── NOTIFICATION IMPORTS ──────────────────────────────────────────────────────
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/enums/notification-type.enum';
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(MainRequest.name) private requestModel: Model<RequestDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    private paymobService: PaymobService,
    private invoiceService: InvoiceService,
    private mailService: MailService,
    // ── NOTIFICATION SERVICE ─────────────────────────────────────────────────
    private readonly notificationService: NotificationService,
    // ─────────────────────────────────────────────────────────────────────────
  ) {}

  async payDeposit(requestId: string, userId: string) {
    const request = await this.requestModel.findById(requestId);
    if (!request) throw new NotFoundException('Request not found');

    if (request.userId.toString() !== userId)
      throw new BadRequestException('Not authorized');

    if (request.isFullyPaid)
      throw new BadRequestException('Request is already fully paid');

    if (request.status !== RequestStatus.ACCEPTED)
      throw new BadRequestException(
        'Request must be accepted by technician first',
      );

    if (request.depositStatus !== DepositStatus.UNPAID)
      throw new BadRequestException('Deposit already paid or pending');

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

    const { paymentUrl, orderId } = await this.paymobService.getPaymentUrl(
      request.depositAmount,
      {
        email: user.email,
        fullName: user.fullName,
        phone: user.phone ?? 'N/A',
      },
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

      // ── DEPOSIT confirmed ────────────────────────────────────────────────
      if (payment.type === PaymentType.DEPOSIT) {
        const updatedRequest = await this.requestModel
          .findByIdAndUpdate(
            payment.requestId,
            {
              depositStatus: DepositStatus.PAID,
              status: RequestStatus.IN_PROGRESS,
            },
            { new: true },
          )
          .populate('assignedTechnician', '_id');

        // NOTIFICATION , tell the technician the deposit has been received
        if (updatedRequest?.assignedTechnician) {
          const technicianUserId = (
            updatedRequest.assignedTechnician as any
          )._id?.toString();

          await this.notificationService.send({
            recipientId: technicianUserId,
            type: NotificationType.DEPOSIT_PAID,
            title: 'تم دفع العربون 💰',
            body: 'قام العميل بدفع العربون. يمكنك الآن التوجه لإنجاز الطلب.',
            requestId: payment.requestId.toString(),
            metadata: {
              depositAmount: payment.amount,
              clientId: payment.userId.toString(),
            },
          });
        }
        // ──────────────────────────────────────────────────────────────────
      }

      // ── REMAINING PAYMENT confirmed ──────────────────────────────────────
      if (payment.type === PaymentType.REMAINING) {
        const updatedRequest = await this.requestModel
          .findByIdAndUpdate(
            payment.requestId,
            {
              isFullyPaid: true,
              status: RequestStatus.COMPLETED,
            },
            { new: true },
          )
          .populate('assignedTechnician', '_id');

        await this.invoiceService.markAsPaid(payment.requestId.toString());

        const invoice = await this.invoiceService.findByRequestId(
          payment.requestId.toString(),
        );

        // NOTIFICATION , tell the technician the full amount has been received
        if (updatedRequest?.assignedTechnician) {
          const technicianUserId = (
            updatedRequest.assignedTechnician as any
          )._id?.toString();

          await this.notificationService.send({
            recipientId: technicianUserId,
            type: NotificationType.REMAINING_PAID,
            title: 'تم استلام المبلغ كاملاً ✅',
            body: `قام العميل بسداد المبلغ المتبقي. إجمالي المبلغ: ${updatedRequest.totalPrice} ج.م.`,
            requestId: payment.requestId.toString(),
            metadata: {
              totalPrice: updatedRequest.totalPrice,
              remainingAmount: payment.amount,
              clientId: payment.userId.toString(),
            },
          });
        }
        // ──────────────────────────────────────────────────────────────────

        return { message: 'Payment successful', invoice };
      }
    }

    return { message: 'Webhook handled' };
  }

  async payRemaining(requestId: string, userId: string) {
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

    const { paymentUrl, orderId } = await this.paymobService.getPaymentUrl(
      remainingAmount,
      { email: user.email, fullName: user.fullName, phone: user.phone ?? 'N/A' },
    );

    await this.paymentModel.findByIdAndUpdate(payment._id, {
      paymobOrderId: orderId,
    });
    await this.requestModel.findByIdAndUpdate(requestId, {
      paymentId: payment._id,
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

  async getDepositPayment(requestId: string) {
    return this.paymentModel.findOne({
      requestId: new Types.ObjectId(requestId),
      type: PaymentType.DEPOSIT,
      status: PaymentStatus.PAID,
    });
  }

  async refundDeposit(payment: PaymentDocument) {
    await this.paymobService.refundPayment(
      payment.paymobTransactionId!,
      payment.amount,
    );

    await this.paymentModel.findByIdAndUpdate(payment._id, {
      status: PaymentStatus.REFUNDED,
    });

    await this.paymentModel.create({
      requestId: payment.requestId,
      userId: payment.userId,
      amount: payment.amount,
      type: PaymentType.REFUND,
      status: PaymentStatus.PAID,
      paymobTransactionId: payment.paymobTransactionId,
      paidAt: new Date(),
    });

    await this.requestModel.findByIdAndUpdate(payment.requestId, {
      depositStatus: DepositStatus.UNPAID,
    });

    const user = await this.userModel.findById(payment.userId);
    if (user) {
      await this.mailService.sendRefundEmail(user.email, {
        clientName: user.fullName,
        amount: payment.amount,
      });

      // ── NOTIFICATION → tell the client their deposit has been refunded ───
      await this.notificationService.send({
        recipientId: payment.userId.toString(),
        type: NotificationType.DEPOSIT_REFUNDED,
        title: 'تم استرداد العربون 💸',
        body: `تم استرداد مبلغ العربون (${payment.amount} ج.م) بنجاح.`,
        requestId: payment.requestId.toString(),
        metadata: {
          refundedAmount: payment.amount,
        },
      });
      // ────────────────────────────────────────────────────────────────────
    }
  }
}
