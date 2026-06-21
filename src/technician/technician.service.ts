import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Step2Dto } from './dto/step2.dto';
import { Step3Dto } from './dto/step3.dto';
import { Step4Dto } from './dto/step4.dto';
import {
  ServiceDocument,
  ServiceEntity,
} from 'src/services/schemas/service.schema';
import {
  Category,
  CategoryDocument,
} from 'src/categories/schemas/category.schema';
import { plainToInstance } from 'class-transformer';
import { TechnicianDataDto } from './dto/tech-data.dto';
import {
  Technician,
  TechnicianDocument,
  VerificationStatus,
} from './schemas/technician.schema';
import {
  MainRequest,
  RequestDocument,
} from 'src/request/schemas/request.schema';
import { RequestStatus } from 'src/request/enums/request-status.enum';
import { UpdateWorkInfoDto } from './dto/update-work-info.dto';
@Injectable()
export class TechnicianService {
  constructor(
    @InjectModel(Technician.name)
    private technicianModel: Model<TechnicianDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(ServiceEntity.name)
    private serviceModel: Model<ServiceDocument>,
    @InjectModel(MainRequest.name)
    private requestModel: Model<RequestDocument>,
  ) {}

  private toTechnicianDataDto(data: any) {
    return plainToInstance(TechnicianDataDto, data, {
      excludeExtraneousValues: true,
    });
  }

  async updateStep2(userId: string, dto: Step2Dto) {
    const technician = await this.technicianModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!technician) throw new NotFoundException('Technician not found');

    const category = await this.categoryModel.findById(dto.categoryId);
    if (!category) throw new NotFoundException('Category not found');
    if (!category.isActive)
      throw new BadRequestException('Category is not active');

    const services = await this.serviceModel.find({
      _id: { $in: dto.serviceIds },
      isActive: true,
    });

    if (services.length !== dto.serviceIds.length)
      throw new BadRequestException('Some services not found or inactive');

    const invalid = services.some(
      (s) => s.category.toString() !== dto.categoryId,
    );
    if (invalid)
      throw new BadRequestException(
        'Some services do not belong to this category',
      );

    technician.specialization = {
      categoryId: new Types.ObjectId(dto.categoryId),
      serviceIds: dto.serviceIds.map((id) => new Types.ObjectId(id)),
    };
    technician.currentStep = 2;
    await technician.save();

    return { message: 'Step 2 completed', currentStep: technician.currentStep };
  }

  async updateStep3(userId: string, dto: Step3Dto) {
    const technician = await this.technicianModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { ...dto, currentStep: 3 },
      { new: true },
    );
    if (!technician) throw new NotFoundException('Technician not found');
    return { message: 'Step 3 completed', currentStep: technician.currentStep };
  }

  async updateStep4(userId: string, dto: Step4Dto) {
    const technician = await this.technicianModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { ...dto, currentStep: 4 },
      { new: true },
    );
    if (!technician) throw new NotFoundException('Technician not found');
    return { message: 'Step 4 completed', currentStep: technician.currentStep };
  }

  async updateStep5(
    userId: string,
    files: {
      personalImage: string;
      idFrontImage: string;
      idBackImage: string;
      certificateImage?: string;
      criminalRecordImage?: string;
    },
  ) {
    const technician = await this.technicianModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        ...files,
        currentStep: 5,
        isProfileComplete: true,
        verificationStatus: VerificationStatus.PENDING,
      },
      { new: true },
    );
    if (!technician) throw new NotFoundException('Technician not found');
    return {
      message: 'Registration complete! Awaiting verification.',
      isProfileComplete: technician.isProfileComplete,
      verificationStatus: technician.verificationStatus,
    };
  }

  async getTechData(userId: string) {
    const technician = await this.technicianModel
    .findOne({ userId: new Types.ObjectId(userId) })
    .populate('userId')
    .populate({
      path: 'specialization.categoryId',
      select: 'name',
    })
    .lean()
    .exec();

    if (!technician) throw new NotFoundException('Technician not found');

    if (technician.currentStep !== 5)
      throw new BadRequestException('Registration not completed');

    return {
      message: 'Technician data fetched successfully',
      data: this.toTechnicianDataDto(technician),
    };
  }

  async getDashboard(userId: string) {
    //* Technician document
    const technician = await this.technicianModel
    .findOne({ userId: new Types.ObjectId(userId) })
    .select(
      'verificationStatus isAvailable averageRating totalReviews currentStep isProfileComplete',
    )
    .lean();

    if (!technician) throw new NotFoundException('Technician not found');

    const [stats, recentRequests, activeRequest] = await Promise.all([
      //* 1. request stats by status
      this.requestModel.aggregate([
        { $match: { assignedTechnician: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      //* 2. last 5 requests
      this.requestModel
      .find({ assignedTechnician: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'fullName phone')
      .populate('serviceId', 'title price')
      .select('title status preferredDate preferredTime createdAt')
      .lean(),

      //* 3. active request
      this.requestModel
      .findOne({
        assignedTechnician: new Types.ObjectId(userId),
        status: RequestStatus.IN_PROGRESS,
      })
      .populate('userId', 'fullName phone governorate city')
      .populate('serviceId', 'title price')
      .lean(),
    ]);

    //* 4. counts of each status
    const counts = {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const item of stats) {
      counts.total += item.count;
      if (item._id === RequestStatus.PENDING) counts.pending = item.count;
      if (item._id === RequestStatus.IN_PROGRESS)
        counts.inProgress = item.count;
      if (item._id === RequestStatus.COMPLETED) counts.completed = item.count;
      if (item._id === RequestStatus.CANCELLED) counts.cancelled = item.count;
    }

    return {
      message: 'Technician Dashboard retrieved successfully',
      data: {
        profile: {
          verificationStatus: technician.verificationStatus,
          isAvailable: technician.isAvailable,
          averageRating: technician.averageRating,
          totalReviews: technician.totalReviews,
          currentStep: technician.currentStep,
          isProfileComplete: technician.isProfileComplete,
        },
        stats: counts,
        activeRequest: activeRequest ?? null,
        recentRequests,
      },
    };
  }
async updateWorkInfo(
  userId: string,
  dto: UpdateWorkInfoDto,
) {
  const technician = await this.technicianModel.findOne({
    userId: new Types.ObjectId(userId),
  });

  if (!technician) {
    throw new NotFoundException('Technician not found');
  }

  if (dto.jobTitle !== undefined) {
    technician.jobTitle = dto.jobTitle;
  }

  if (dto.serviceIds) {
    const categoryId = technician.specialization?.categoryId;

    if (!categoryId) {
      throw new BadRequestException(
        'Technician category is not set',
      );
    }

    const services = await this.serviceModel.find({
      _id: { $in: dto.serviceIds },
      isActive: true,
    });

    if (services.length !== dto.serviceIds.length) {
      throw new BadRequestException(
        'Some services not found or inactive',
      );
    }

    const invalidService = services.some(
      (service) =>
        service.category.toString() !== categoryId.toString(),
    );

    if (invalidService) {
      throw new BadRequestException(
        'Some services do not belong to technician category',
      );
    }

    technician.specialization.serviceIds = dto.serviceIds.map(
      (id) => new Types.ObjectId(id),
    );
  }

  await technician.save();

  const updatedTechnician = await this.technicianModel
    .findById(technician._id)
    .populate('userId')
    .populate([
      {
        path: 'specialization.categoryId',
        select: 'name',
      },
      {
        path: 'specialization.serviceIds',
        select: 'name',
      },
    ])
    .lean()
    .exec();

  return {
    message: 'Work information updated successfully',
    data: this.toTechnicianDataDto(updatedTechnician),
  };
}
}