import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import {
  User,
  UserDocument,
  UserRole,
  VerificationStatus,
} from 'src/users/schemas/user.schema';
import { AdminTechnicianDto } from './dto/admin-technician-response.dto';
import { AdminUserResponseDto } from './dto/admin-user-response.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
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
        totalPages,
      },
    };
  }

  //* get all pending technicians
  async getPendingTechnicians(query: PaginationDto) {
    const { page, limit } = query;
    const filter = {
      role: UserRole.TECHNICIAN,
      verificationStatus: VerificationStatus.PENDING,
    };
    const skip = (page - 1) * limit;

    const [total, techs] = await Promise.all([
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
      message: 'Pending technicians retrieved successfully',
      data: this.toAdminTechnicianDto(techs),
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  //* get technician by id
  async getTechnicianById(id: string) {
    const technician = await this.userModel
    .findOne({
      _id: id,
      role: UserRole.TECHNICIAN,
    })
    .lean()
    .exec();

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    return {
      message: `Technician with id ${id} retrieved successfully`,
      data: this.toAdminTechnicianDto(technician),
    };
  }

  //* approve technician
  async approveTechnician(id: string) {
    const user = await this.userModel.findOne({
      _id: id,
      role: UserRole.TECHNICIAN,
    });

    if (!user) {
      throw new NotFoundException('Technician not found');
    }

    if (
      user.verificationStatus !== VerificationStatus.PENDING ||
      user.currentStep !== 5 ||
      !user.isProfileComplete
    ) {
      throw new BadRequestException(
        'User is not pending or registration not completed',
      );
    }

    const updatedTechnician = await this.userModel
    .findByIdAndUpdate(
      id,
      {
        verificationStatus: VerificationStatus.APPROVED,
        verifiedAt: new Date(),
        rejectionReason: null,
      },
      { new: true },
    )
    .lean()
    .exec();

    return {
      message: 'Technician approved successfully',
      data: this.toAdminTechnicianDto(updatedTechnician),
    };
  }

  //* reject technician
  async rejectTechnician(id: string, reason: string) {
    const user = await this.userModel.findOne({
      _id: id,
      role: UserRole.TECHNICIAN,
    });

    if (!user) {
      throw new NotFoundException('Technician not found');
    }

    if (
      user.verificationStatus !== VerificationStatus.PENDING ||
      user.currentStep !== 5
    ) {
      throw new BadRequestException(
        'User is not pending or registration not completed',
      );
    }

    const updatedTechnician = await this.userModel
    .findByIdAndUpdate(
      id,
      {
        verificationStatus: VerificationStatus.REJECTED,
        rejectionReason: reason,
      },
      { new: true },
    )
    .lean()
    .exec();

    return {
      message: 'Technician rejected successfully',
      data: this.toAdminTechnicianDto(updatedTechnician),
    };
  }
}
