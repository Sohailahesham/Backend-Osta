import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from 'src/users/schemas/user.schema';
import {
  Technician,
  TechnicianDocument,
  VerificationStatus,
} from '../technician/schemas/technician.schema';
import { AdminTechnicianDto } from './dto/admin-technician-response.dto';
import { AdminUserResponseDto } from './dto/admin-user-response.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
  MainRequest,
  RequestDocument,
} from 'src/request/schemas/request.schema';
import { RequestStatus } from 'src/request/enums/request-status.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Technician.name)
    private technicianModel: Model<TechnicianDocument>,
    @InjectModel(MainRequest.name)
    private requestModel: Model<RequestDocument>,
  ) {}

  //* private methods to transform data
  private toAdminTechnicianDto(data: any) {
    return plainToInstance(AdminTechnicianDto, data, {
      excludeExtraneousValues: true,
    });
  }
  private toAdminUserDto(data: any) {
    return plainToInstance(AdminUserResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }

  //* get all users with filtering by role
  async getAllUsers(query: AdminUsersQueryDto) {
    const { page, limit, role } = query;
    const filter = role ? { role } : {};
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      this.userModel.countDocuments(filter),
      this.userModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    ]);
    const totalPages = Math.ceil(total / limit);

    if (page > totalPages) throw new NotFoundException('Page not found');

    return {
      message: 'Users retrieved successfully',
      data: this.toAdminUserDto(users),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  //* get user by id
  async getUserById(id: string) {
    const user = await this.userModel.findById(id).lean().exec();
    if (!user) throw new NotFoundException('User not found');
    return {
      message: 'User retrieved successfully',
      data: this.toAdminUserDto(user),
    };
  }

  //* get all pending technicians
  async getPendingTechnicians(query: PaginationDto) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [total, techs] = await Promise.all([
      this.technicianModel.countDocuments({
        verificationStatus: VerificationStatus.PENDING,
      }),
      this.technicianModel
      .find({ verificationStatus: VerificationStatus.PENDING })
      .populate(
        'userId',
        '-password -refreshToken -otp -otpExpires -verificationToken -verificationTokenExpires',
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    ]);

    return {
      message: 'Pending technicians retrieved successfully',
      data: this.toAdminTechnicianDto(techs),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  //* get technician by id
  async getTechnicianById(id: string) {
    const technician = await this.technicianModel
    .findById(id)
    .populate(
      'userId',
      '-password -refreshToken -otp -otpExpires -verificationToken -verificationTokenExpires',
    )
    .lean()
    .exec();

    if (!technician) throw new NotFoundException('Technician not found');

    return {
      message: `Technician retrieved successfully`,
      data: this.toAdminTechnicianDto(technician),
    };
  }

  //* approve technician
  async approveTechnician(id: string) {
    const technician = await this.technicianModel.findById(id);
    if (!technician) throw new NotFoundException('Technician not found');

    if (
      technician.verificationStatus !== VerificationStatus.PENDING ||
      technician.currentStep !== 5 ||
      !technician.isProfileComplete
    ) {
      throw new BadRequestException(
        'Technician is not pending or registration not completed',
      );
    }

    technician.verificationStatus = VerificationStatus.APPROVED;
    technician.verifiedAt = new Date();
    technician.rejectionReason = undefined;
    await technician.save();

    return {
      message: 'Technician approved successfully',
      data: this.toAdminTechnicianDto(
        await this.technicianModel
        .findById(id)
        .populate(
          'userId',
          '-password -refreshToken -otp -otpExpires -verificationToken -verificationTokenExpires',
        )
        .lean(),
      ),
    };
  }

  //* reject technician
  async rejectTechnician(id: string, reason: string) {
    const technician = await this.technicianModel.findById(id);
    if (!technician) throw new NotFoundException('Technician not found');

    if (
      technician.verificationStatus !== VerificationStatus.PENDING ||
      technician.currentStep !== 5
    ) {
      throw new BadRequestException(
        'Technician is not pending or registration not completed',
      );
    }

    technician.verificationStatus = VerificationStatus.REJECTED;
    technician.rejectionReason = reason;
    await technician.save();

    return {
      message: 'Technician rejected successfully',
      data: this.toAdminTechnicianDto(
        await this.technicianModel
        .findById(id)
        .populate(
          'userId',
          '-password -refreshToken -otp -otpExpires -verificationToken -verificationTokenExpires',
        )
        .lean(),
      ),
    };
  }

  //* get all technicians
  async getAllTechnicians(query: PaginationDto) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [total, technicians] = await Promise.all([
      this.technicianModel.countDocuments({
        verificationStatus: VerificationStatus.APPROVED,
      }),
      this.technicianModel
      .find({ verificationStatus: VerificationStatus.APPROVED })
      .populate(
        'userId',
        '-password -refreshToken -otp -otpExpires -verificationToken -verificationTokenExpires',
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    if (page > totalPages) throw new NotFoundException('Page not found');

    return {
      message: 'Technicians retrieved successfully',
      data: this.toAdminTechnicianDto(technicians),
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  //* Change Role to admin
  async setAdminRole(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const updatedUser = await this.userModel
    .findByIdAndUpdate(id, { role: UserRole.ADMIN }, { new: true })
    .lean()
    .exec();

    return {
      message: 'Role updated successfully',
      data: this.toAdminUserDto(updatedUser),
    };
  }

  //* get dashboard
  async getDashboard() {
    const [
      userStats,
      technicianStats,
      requestStats,
      recentRequests,
      topTechnicians,
    ] = await Promise.all([
      //* get all users with filtering by role
      this.userModel.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),

      //* get all pending technicians
      this.technicianModel.aggregate([
        { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
      ]),

      //* get all requests
      this.requestModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      //* last 5 requests
      this.requestModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'fullName')
      .populate('serviceId', 'title')
      .select('title status createdAt preferredDate')
      .lean(),

      //* top 5 technicians
      this.technicianModel
      .find({ verificationStatus: VerificationStatus.APPROVED })
      .sort({ averageRating: -1 })
      .limit(5)
      .populate('userId', 'fullName phone')
      .select('averageRating totalReviews isAvailable')
      .lean(),
    ]);

    //* users aggregate
    const users = { total: 0, clients: 0, technicians: 0, admins: 0 };
    for (const item of userStats) {
      users.total += item.count;
      if (item._id === UserRole.CLIENT) users.clients = item.count;
      if (item._id === UserRole.TECHNICIAN) users.technicians = item.count;
      if (item._id === UserRole.ADMIN) users.admins = item.count;
    }

    //* technicians aggregate
    const technicians = {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      incomplete: 0,
    };
    for (const item of technicianStats) {
      technicians.total += item.count;
      if (item._id === VerificationStatus.APPROVED)
        technicians.approved = item.count;
      if (item._id === VerificationStatus.PENDING)
        technicians.pending = item.count;
      if (item._id === VerificationStatus.REJECTED)
        technicians.rejected = item.count;
      if (item._id === VerificationStatus.INCOMPLETE)
        technicians.incomplete = item.count;
    }

    //* requests aggregate
    const requests = {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const item of requestStats) {
      requests.total += item.count;
      if (item._id === RequestStatus.PENDING) requests.pending = item.count;
      if (item._id === RequestStatus.IN_PROGRESS)
        requests.inProgress = item.count;
      if (item._id === RequestStatus.COMPLETED) requests.completed = item.count;
      if (item._id === RequestStatus.CANCELLED) requests.cancelled = item.count;
    }

    return {
      message: 'Admin Dashboard retrieved successfully',
      data: {
        users,
        technicians,
        requests,
        recentRequests,
        topTechnicians,
      },
    };
  }
}
