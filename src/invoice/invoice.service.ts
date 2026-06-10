import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import {
  MainRequest,
  RequestDocument,
} from '../request/schemas/request.schema';
import { MailService } from '../mail/mail.service';
import { UserRole } from 'src/users/schemas/user.schema';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(MainRequest.name) private requestModel: Model<RequestDocument>,
    private mailService: MailService,
  ) {}

  async createFromRequest(requestId: string): Promise<InvoiceDocument> {
    const request = await this.requestModel
      .findById(requestId)
      .populate('userId', 'fullName email')
      .populate('assignedTechnician', 'fullName')
      .populate('serviceId', 'name')
      .lean()
      .exec();

    if (!request) throw new NotFoundException('Request not found');

    if (!request.isFullyPaid)
      throw new BadRequestException('Request must be fully paid first');

    const invoiceNumber = `INV-${Date.now()}`;
    const remainingAmount = request.totalPrice - request.depositAmount;

    const invoice = await this.invoiceModel.create({
      invoiceNumber,
      requestId: new Types.ObjectId(requestId),
      clientId: new Types.ObjectId(
        (request.userId as any)?._id ?? request.userId,
      ),
      technicianId: new Types.ObjectId(
        (request.assignedTechnician as any)?._id ?? request.assignedTechnician,
      ),
      depositAmount: request.depositAmount,
      totalPrice: request.totalPrice,
      remainingAmount,
      isPaid: false,
    });

    return invoice;
  }
  async markAsPaid(requestId: string): Promise<void> {
    let invoice = (await this.invoiceModel
      .findOne({
        requestId: new Types.ObjectId(requestId),
      })
      .exec()) as InvoiceDocument | null;

    if (!invoice) {
      invoice = await this.createFromRequest(requestId);
    }

    if (invoice.isPaid) return;

    invoice.isPaid = true;
    await invoice.save();

    const request = await this.requestModel
      .findById(requestId)
      .populate('userId', 'fullName email')
      .populate('assignedTechnician', 'fullName')
      .populate('serviceId', 'name')
      .lean()
      .exec();

    if (request) {
      const client = request.userId as any;
      await this.mailService.sendInvoiceEmail(client.email, {
        invoiceNumber: invoice.invoiceNumber,
        clientName: client.fullName,
        technicianName: (request.assignedTechnician as any)?.fullName,
        serviceName: (request.serviceId as any)?.name,
        completionNote: request.completionNote ?? '',
        depositAmount: invoice.depositAmount,
        totalPrice: invoice.totalPrice,
        remainingAmount: invoice.remainingAmount,
        createdAt: invoice.createdAt,
      });
    }
  }

  async findByClient(clientId: string) {
    return this.invoiceModel
      .find({ clientId: new Types.ObjectId(clientId) })
      .populate({
        path: 'requestId',
        select:
          'address preferredDate preferredTime notes completionNote status categoryId serviceId',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'serviceId', select: 'name priceRange' },
        ],
      })
      .populate('technicianId', 'fullName phone')
      .populate('clientId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findById(id: string, userId: string, userRole: UserRole) {
    const invoice = await this.invoiceModel
      .findById(id)
      .populate({
        path: 'requestId',
        select:
          'address preferredDate preferredTime notes completionNote status categoryId serviceId',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'serviceId', select: 'name priceRange' },
        ],
      })
      .populate('clientId', 'fullName email phone')
      .populate('technicianId', 'fullName phone')
      .lean()
      .exec();

    if (!invoice) throw new NotFoundException('Invoice not found');
    if (userRole === UserRole.ADMIN) return invoice;
    if (invoice.clientId.toString() !== userId)
      throw new ForbiddenException('Not authorized for this invoice');

    return invoice;
  }

  async findAll() {
    return this.invoiceModel
      .find()
      .populate({
        path: 'requestId',
        select:
          'address preferredDate preferredTime status categoryId serviceId',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'serviceId', select: 'name' },
        ],
      })
      .populate('clientId', 'fullName email phone')
      .populate('technicianId', 'fullName phone')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findByRequestId(requestId: string) {
    return this.invoiceModel
      .findOne({ requestId: new Types.ObjectId(requestId) })
      .populate({
        path: 'requestId',
        select:
          'address preferredDate preferredTime notes completionNote status',
        populate: [
          { path: 'categoryId', select: 'name' },
          { path: 'serviceId', select: 'name' },
        ],
      })
      .populate('clientId', 'fullName email phone')
      .populate('technicianId', 'fullName phone')
      .lean()
      .exec();
  }
}
