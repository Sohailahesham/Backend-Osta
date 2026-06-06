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

@Injectable()
export class RequestService {
  constructor(
    @InjectModel(MainRequest.name)
    private readonly requestModel: Model<RequestDocument>,
  ) {}

  // ─── Create (USER) ────────────────────────────────────────────────────────

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

  // ─── Get All Pending (TECHNICIAN sees all pending to pick from) ───────────

  async findAllPending(dto: RequestPaginationDto) {
    const { page = 1, limit = 10 } = dto;

    const filter = { status: RequestStatus.PENDING };

    const [data, total] = await Promise.all([
      this.requestModel
        .find(filter)
        .populate('userId', 'name phone')
        .populate('categoryId', 'name')
        .populate('serviceId', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.requestModel.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Get All (ADMIN) ──────────────────────────────────────────────────────

  async findAll(dto: RequestPaginationDto) {
    const { page = 1, limit = 10, status } = dto;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      this.requestModel
        .find(filter)
        .populate('userId', 'name email')
        .populate('categoryId', 'name')
        .populate('serviceId', 'name')
        .populate('assignedTechnician', 'name phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.requestModel.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Get My Requests (USER) ───────────────────────────────────────────────

  async findMyRequests(userId: string, dto: RequestPaginationDto) {
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
        .populate('assignedTechnician', 'name phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.requestModel.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Get My Assigned Requests (TECHNICIAN) ────────────────────────────────

  async findAssignedRequests(technicianId: string, dto: RequestPaginationDto) {
    const { page = 1, limit = 10, status } = dto;
    const filter: Record<string, unknown> = {
      assignedTechnician: new Types.ObjectId(technicianId),
    };
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      this.requestModel
        .find(filter)
        .populate('userId', 'name phone')
        .populate('categoryId', 'name')
        .populate('serviceId', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.requestModel.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Get By Id ────────────────────────────────────────────────────────────

  async findById(requestId: string): Promise<RequestDocument> {
    if (!Types.ObjectId.isValid(requestId))
      throw new NotFoundException('Request not found');

    const request = await this.requestModel
      .findById(requestId)
      .populate('userId', 'name email phone')
      .populate('categoryId', 'name')
      .populate('serviceId', 'name')
      .populate('assignedTechnician', 'name phone')
      .exec();

    if (!request)
      throw new NotFoundException(`Request #${requestId} not found`);
    return request;
  }

  // ─── Accept Request (TECHNICIAN) ──────────────────────────────────────────
  // technician accepts a pending request → assigns themselves → IN_PROGRESS

  async acceptRequest(
    requestId: string,
    technicianId: string,
  ): Promise<RequestDocument> {
    const request = await this.findById(requestId);

    if (request.status !== RequestStatus.PENDING)
      throw new BadRequestException('Only pending requests can be accepted');

    request.assignedTechnician = new Types.ObjectId(technicianId) as any;
    request.status = RequestStatus.IN_PROGRESS;
    return request.save();
  }
  // helper to get assignedTechnician id as string
  private getAssignedId(request: RequestDocument): string | null {
    const assigned = request.assignedTechnician as any;
    if (!assigned) return null;
    return assigned._id?.toString() ?? assigned.toString();
  }
  // ─── Complete Request (TECHNICIAN) ────────────────────────────────────────

  async completeRequest(
    requestId: string,
    technicianId: string,
  ): Promise<RequestDocument> {
    const request = await this.findById(requestId);

    const assignedId = this.getAssignedId(request);

    if (!assignedId)
      throw new BadRequestException('No technician assigned to this request');

    if (assignedId !== technicianId)
      throw new ForbiddenException(
        'You can only complete your assigned requests',
      );

    if (request.status !== RequestStatus.IN_PROGRESS)
      throw new BadRequestException(
        'Only in_progress requests can be completed',
      );

    request.status = RequestStatus.COMPLETED;
    return request.save();
  }
  // ─── Cancel ───────────────────────────────────────────────────────────────
  // USER      → only if PENDING
  // TECHNICIAN → only their assigned, except COMPLETED
  // ADMIN     → anything except COMPLETED
  async cancel(
    requestId: string,
    userId: string,
    userRole: UserRole,
    reason?: string,
  ): Promise<RequestDocument> {
    const request = await this.findById(requestId);

    if (request.status === RequestStatus.COMPLETED)
      throw new BadRequestException('Cannot cancel a completed request');

    if (userRole === UserRole.CLIENT) {
      const requestUserId =
        (request.userId as any)?._id?.toString() ?? request.userId?.toString();

      if (requestUserId !== userId)
        throw new ForbiddenException('You can only cancel your own requests');

      if (request.status !== RequestStatus.PENDING)
        throw new ForbiddenException(
          'Clients can only cancel pending requests',
        );
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

    request.status = RequestStatus.CANCELLED;
    request.cancellation = {
      cancelledBy: new Types.ObjectId(userId) as any,
      role: userRole,
      reason: reason ?? undefined,
      cancelledAt: new Date(),
    };

    return request.save();
  }
  // ─── Delete (ADMIN) ───────────────────────────────────────────────────────

  async delete(requestId: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(requestId))
      throw new NotFoundException('Request not found');

    const deleted = await this.requestModel.findByIdAndDelete(requestId);
    if (!deleted)
      throw new NotFoundException(`Request #${requestId} not found`);
    return { message: 'Request deleted successfully' };
  }
  // ─── Update Status (ADMIN override) ──────────────────────────────────────

  async updateStatus(
    requestId: string,
    dto: UpdateStatusDto,
  ): Promise<RequestDocument> {
    const request = await this.findById(requestId);
    request.status = dto.status;
    return request.save();
  }
  // ─── Get Requests By User Id (ADMIN) ─────────────────────────────────────

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
        .populate('assignedTechnician', 'name phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.requestModel.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
