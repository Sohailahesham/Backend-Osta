import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wallet, WalletDocument, TransactionType } from './schemas/wallet.schema';
import { Withdrawal, WithdrawalDocument, WithdrawalStatus, WithdrawalMethod } from './schemas/withdrawal.schema';

const COMMISSION_RATE = 0.10; // 10%

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Withdrawal.name) private withdrawalModel: Model<WithdrawalDocument>,
  ) {}

  // يعمل wallet للفني لما يسجل
  async createWallet(userId: string): Promise<WalletDocument> {
    return this.walletModel.create({
      userId: new Types.ObjectId(userId),
    });
  }

  // بعد ما الشغل يخلص ويتدفع
  async creditTechnician(userId: string, totalPrice: number, requestId: string) {
    const commission = totalPrice * COMMISSION_RATE;
    const technicianAmount = totalPrice - commission;

    const wallet = await this.walletModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!wallet) throw new NotFoundException('Wallet not found');

    wallet.balance += technicianAmount;
    wallet.totalEarned += technicianAmount;
    wallet.transactions.push({
      type: TransactionType.CREDIT,
      amount: technicianAmount,
      description: `Payment for request #${requestId} (after 10% commission)`,
      requestId: new Types.ObjectId(requestId),
      createdAt: new Date(),
    } as any);

    await wallet.save();
    return wallet;
  }

  // الفني يشوف رصيده
  async getWallet(userId: string) {
    const wallet = await this.walletModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();

    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  // الفني يطلب سحب
  async requestWithdrawal(
    userId: string,
    amount: number,
    method: WithdrawalMethod,
    accountNumber: string,
  ) {
    const wallet = await this.walletModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!wallet) throw new NotFoundException('Wallet not found');

    if (wallet.balance < amount)
      throw new BadRequestException('Insufficient balance');

    if (amount <= 0)
      throw new BadRequestException('Amount must be greater than 0');

    const withdrawal = await this.withdrawalModel.create({
      userId: new Types.ObjectId(userId),
      amount,
      method,
      accountNumber,
      status: WithdrawalStatus.PENDING,
    });

    return withdrawal;
  }

  // الأدمن يشوف كل طلبات السحب
  async getAllWithdrawals() {
    return this.withdrawalModel
      .find()
      .populate('userId', 'fullName phone email')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async approveWithdrawal(withdrawalId: string) {
    const withdrawal = await this.withdrawalModel.findById(withdrawalId);
    if (!withdrawal) throw new NotFoundException('Withdrawal not found');

    if (withdrawal.status !== WithdrawalStatus.PENDING)
      throw new BadRequestException('Withdrawal already processed');

    const wallet = await this.walletModel.findOne({ userId: withdrawal.userId });
    if (!wallet) throw new NotFoundException('Wallet not found');

    if (wallet.balance < withdrawal.amount)
      throw new BadRequestException('Insufficient balance');

    wallet.balance -= withdrawal.amount;
    wallet.totalWithdrawn += withdrawal.amount;
    wallet.transactions.push({
      type: TransactionType.DEBIT,
      amount: withdrawal.amount,
      description: `Withdrawal via ${withdrawal.method}`,
      createdAt: new Date(),
    } as any);
    await wallet.save();

    withdrawal.status = WithdrawalStatus.APPROVED;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    return withdrawal;
  }

  async rejectWithdrawal(withdrawalId: string, reason: string) {
    const withdrawal = await this.withdrawalModel.findById(withdrawalId);
    if (!withdrawal) throw new NotFoundException('Withdrawal not found');

    if (withdrawal.status !== WithdrawalStatus.PENDING)
      throw new BadRequestException('Withdrawal already processed');

    withdrawal.status = WithdrawalStatus.REJECTED;
    withdrawal.rejectionReason = reason;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    return withdrawal;
  }
}