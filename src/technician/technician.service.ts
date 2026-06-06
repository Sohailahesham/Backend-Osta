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

@Injectable()
export class TechnicianService {
  constructor(
    @InjectModel(Technician.name)
    private technicianModel: Model<TechnicianDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(ServiceEntity.name)
    private serviceModel: Model<ServiceDocument>,
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
      .findOne({ userId })
      .populate(
        'userId',
        '-password -refreshToken -otp -otpExpires -verificationToken -verificationTokenExpires',
      )
      .lean()
      .exec();

    if (!technician) throw new NotFoundException('Technician not found');

    if (technician.currentStep !== 5)
      throw new BadRequestException('Registration not completed');

    return {
      message: 'Technician data fetched successfully',
      data: technician,
    };
  }
}
