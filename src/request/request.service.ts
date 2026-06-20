/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MainRequest, RequestDocument } from './schemas/request.schema';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestPaginationDto } from './dto/request-pagination.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RequestStatus } from './enums/request-status.enum';
import { UserRole } from 'src/users/schemas/user.schema';
import { InvoiceService } from 'src/invoice/invoice.service';
import { PaymentService } from 'src/payment/payment.service';
import { PaymentStatus } from 'src/payment/schemas/payment.schema';
import { ChatGateway } from 'src/chat/chat.gateway';
import {
  Technician,
  TechnicianDocument,
} from 'src/technician/schemas/technician.schema';
import { Request } from 'express';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { CompleteRequestDto } from './dto/complete-request.dto';

@Injectable()
export class RequestService {
  constructor(
    @InjectModel(MainRequest.name)
    private readonly requestModel: Model<RequestDocument>,
    private readonly invoiceService: InvoiceService,
    private readonly paymentService: PaymentService,
    private readonly chatGateway: ChatGateway,
    @InjectModel(Technician.name)
    private readonly technicianModel: Model<TechnicianDocument>,
  ) {}

  async create(
    userId: string,
    dto: CreateRequestDto,
  ): Promise<RequestDocument> {
    return this.requestModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      categoryId: new Types.ObjectId(dto.categoryId),
      serviceId: new Types.ObjectId(dto.serviceId),
      preferredDate: new Date(dto.preferredDate),
      status: RequestStatus.PENDING,
    });
  }

  async findAllPending(dto: RequestPaginationDto, req: AuthRequest) {
    const { page = 1, limit = 10 } = dto;
    const filter: {
      status: RequestStatus;
      assignedTechnician: null;
      categoryId?: Types.ObjectId;
    } = {
      status: RequestStatus.PENDING,
      assignedTechnician: null,
    };

    const technician = await this.technicianModel.findOne({
      userId: new Types.ObjectId(req.user.userId),
    });
    if (technician)
      filter.categoryId = new Types.ObjectId(
        technician.specialization.categoryId,
      );
    const [data, total] = await Promise.all([
      this.requestModel
      .find(filter)
      .populate('userId', 'fullName governorate city')
      .populate('categoryId', 'name')
      .populate('serviceId', 'name description priceRange')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
      this.requestModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAll(dto: RequestPaginationDto) {
    const { page = 1, limit = 10, status, categoryId } = dto;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (categoryId) filter.categoryId = new Types.ObjectId(categoryId);
    const [data, total] = await Promise.all([
      this.requestModel
      .find(filter)
      .populate('userId', 'fullName email')
      .populate('categoryId', 'name')
      .populate('serviceId', 'name')
      .populate('assignedTechnician', 'fullName phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
      this.requestModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMyRequests(userId: string, dto: RequestPaginationDto) {
    const { page = 1, limit = 10, status } = dto;
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (status) filter.status = status;
    const [data, total] = await Promise.all([
      this.requestModel
      .find(filter)
      .populate('categoryId', 'name ')
      .populate('serviceId', 'name priceRange')
      .populate('assignedTechnician', 'fullName phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec(),
      this.requestModel.countDocuments(filter),
    ]);

    // جيب بيانات الفني لكل request عنده assignedTechnician
    const enrichedData = await Promise.all(
      data.map(async (request) => {
        if (!request.assignedTechnician) return request;

        const technician = await this.technicianModel
        .findOne({ userId: (request.assignedTechnician as any)._id })
        .select('averageRating yearsOfExperience')
        .lean();

        return {
          ...request,
          assignedTechnician: {
            ...(request.assignedTechnician as any),
            averageRating: technician?.averageRating ?? 0,
            yearsOfExperience: technician?.yearsOfExperience ?? 0,
          },
        };
      }),
    );

    return {
      data: enrichedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAssignedRequests(technicianId: string, dto: RequestPaginationDto) {
    const { page = 1, limit = 10, status } = dto;
    const filter: Record<string, unknown> = {
      assignedTechnician: new Types.ObjectId(technicianId),
    };
    if (status) filter.status = status;
    const [data, total] = await Promise.all([
      this.requestModel
      .find(filter)
      .populate('userId', 'fullName governorate city')
      .populate('serviceId', 'name priceRange')
      .populate({
        path: 'postId',
        select: 'budget acceptedProposal title',
        populate: {
          path: 'acceptedProposal',
          select: 'estimatedTime price',
        },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
      this.requestModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(requestId: string): Promise<RequestDocument> {
    if (!Types.ObjectId.isValid(requestId))
      throw new NotFoundException('Request not found');
    const request = await this.requestModel
    .findById(requestId)
    .populate('userId', 'fullName email ')
    .populate('categoryId', 'name')
    .populate('serviceId', 'name priceRange')
    .populate('assignedTechnician', 'fullName')
    .exec();
    if (!request)
      throw new NotFoundException(`Request #${requestId} not found`);
    return request;
  }

  private getAssignedId(request: RequestDocument): string | null {
    const assigned = request.assignedTechnician as any;
    if (!assigned) return null;
    return assigned._id?.toString() ?? assigned.toString();
  }

  async acceptRequest(requestId: string, technicianId: string) {
    const request = await this.findById(requestId);
    if (request.status !== RequestStatus.PENDING)
      throw new BadRequestException('Only pending requests can be accepted');

    const technician = await this.technicianModel.findOne({
      userId: new Types.ObjectId(technicianId),
    });
    if (!technician) throw new NotFoundException('Technician not found');

    if (
      technician.specialization.categoryId.toString() !=
      request.categoryId._id.toString()
    )
      throw new BadRequestException(
        'Technician does not specialize in this category',
      );

    request.assignedTechnician = new Types.ObjectId(technicianId) as any;
    request.status = RequestStatus.ACCEPTED;
    await request.save();

    return {
      message:
        'Request accepted successfully. Please pay the deposit to proceed.',
      depositAmount: request.depositAmount,
      request,
    };
  }

  async onTheWay(
    requestId: string,
    technicianId: string,
  ): Promise<RequestDocument> {
    const request = await this.findById(requestId);
    const assignedId = this.getAssignedId(request);

    if (assignedId !== technicianId)
      throw new ForbiddenException(
        'You can only update your assigned requests',
      );

    if (request.status !== RequestStatus.IN_PROGRESS)
      throw new BadRequestException(
        'Request must be in progress first so Client must pay deposit first!',
      );

    request.status = RequestStatus.ON_THE_WAY;
    return request.save();
  }

  async startRequest(
    requestId: string,
    technicianId: string,
  ): Promise<RequestDocument> {
    const request = await this.findById(requestId);
    const assignedId = this.getAssignedId(request);

    if (assignedId !== technicianId)
      throw new ForbiddenException(
        'You can only update your assigned requests',
      );

    if (request.status !== RequestStatus.ON_THE_WAY)
      throw new BadRequestException('Technician must be on the way first');

    request.status = RequestStatus.STARTED;
    return request.save();
  }

async completeRequest(
  requestId: string,
  technicianId: string,
  completeRequestDto: CompleteRequestDto,
): Promise<RequestDocument> {
  const request = await this.findById(requestId);
  const assignedId = this.getAssignedId(request);

  if (!assignedId)
    throw new BadRequestException('No technician assigned to this request');

  if (assignedId !== technicianId)
    throw new ForbiddenException(
      'You can only complete your assigned requests',
    );

  if (request.status !== RequestStatus.STARTED)
    throw new BadRequestException('Only started requests can be completed');

  const {
    servicePrice,
    extraMaterialsPrice = 0,
    completionNote,
  } = completeRequestDto;

  request.status = RequestStatus.COMPLETED;
  request.servicePrice = servicePrice;
  request.extraMaterialsPrice = extraMaterialsPrice;
  request.totalPrice = servicePrice + extraMaterialsPrice;
  request.completionNote = completionNote || null; 

  const savedRequest = await request.save();

  this.chatGateway.closeRoom(requestId);

  return savedRequest;
}

  async cancel(
    requestId: string,
    userId: string,
    userRole: UserRole,
    reason?: string,
  ): Promise<RequestDocument> {
    const request = await this.findById(requestId);

    if (
      request.status === RequestStatus.ON_THE_WAY ||
      request.status === RequestStatus.STARTED ||
      request.status === RequestStatus.COMPLETED
    )
      throw new BadRequestException('Cannot cancel request at this stage');

    if (userRole === UserRole.CLIENT) {
      const requestUserId =
        (request.userId as any)?._id?.toString() ?? request.userId?.toString();

      if (requestUserId !== userId)
        throw new ForbiddenException('You can only cancel your own requests');
    }

    if (userRole === UserRole.TECHNICIAN) {
      const assignedId = this.getAssignedId(request);
      if (!assignedId)
        throw new BadRequestException('No technician assigned to this request');
      if (assignedId !== userId)
        throw new ForbiddenException(
          'You can only cancel your assigned requests',
        );
    }

    // ← الـ refund بيتعمل لأي حد يكنسل
    const payment = await this.paymentService.getDepositPayment(requestId);
    if (payment && payment.status === PaymentStatus.PAID) {
      await this.paymentService.refundDeposit(payment);
    }

    request.status = RequestStatus.CANCELLED;
    request.cancellation = {
      cancelledBy: new Types.ObjectId(userId) as any,
      role: userRole,
      reason: reason ?? undefined,
      cancelledAt: new Date(),
    };
    const savedRequest = await request.save();
    this.chatGateway.closeRoom(requestId);
    return savedRequest;
  }

  async delete(requestId: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(requestId))
      throw new NotFoundException('Request not found');
    const deleted = await this.requestModel.findByIdAndDelete(requestId);
    if (!deleted)
      throw new NotFoundException(`Request #${requestId} not found`);
    return { message: 'Request deleted successfully' };
  }

  async updateStatus(
    requestId: string,
    dto: UpdateStatusDto,
  ): Promise<RequestDocument> {
    const request = await this.findById(requestId);
    request.status = dto.status;
    return request.save();
  }

  async findByUserId(userId: string, dto: RequestPaginationDto) {
    if (!Types.ObjectId.isValid(userId))
      throw new NotFoundException('User not found');
    const { page = 1, limit = 10, status } = dto;
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (status) filter.status = status;
    const [data, total] = await Promise.all([
      this.requestModel
      .find(filter)
      .populate('categoryId', 'name')
      .populate('serviceId', 'name')
      .populate('assignedTechnician', 'fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
      this.requestModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
