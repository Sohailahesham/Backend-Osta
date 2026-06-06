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

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Technician.name)
    private technicianModel: Model<TechnicianDocument>,
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

    const totalPages = Math.ceil(total / limit);
    if (total === 0) {
      return {
        message: 'No pending technicians found',
        data: [],
        meta: { page, limit, total, totalPages: 0 },
      };
    }
    if (page > totalPages) throw new NotFoundException('Page not found');
    return {
      message: 'Pending technicians retrieved successfully',
      data: techs,
      meta: { page, limit, total, totalPages },
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
      data: technician,
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

    const updated = await this.technicianModel
      .findByIdAndUpdate(
        id,
        {
          verificationStatus: VerificationStatus.APPROVED,
          verifiedAt: new Date(),
          rejectionReason: null,
        },
        { new: true },
      )
      .populate('userId', '-password -refreshToken')
      .lean()
      .exec();

    return {
      message: 'Technician approved successfully',
      data: updated,
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

    const updated = await this.technicianModel
      .findByIdAndUpdate(
        id,
        {
          verificationStatus: VerificationStatus.REJECTED,
          rejectionReason: reason,
        },
        { new: true },
      )
      .populate('userId', '-password -refreshToken')
      .lean()
      .exec();

    return {
      message: 'Technician rejected successfully',
      data: updated,
    };
  }
}
