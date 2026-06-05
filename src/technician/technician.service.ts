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

@Injectable()
export class TechnicianService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(ServiceEntity.name)
    private serviceModel: Model<ServiceDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  private toTechnicianDataDto(data: any) {
    return plainToInstance(TechnicianDataDto, data, {
      excludeExtraneousValues: true,
    });
  }

  async updateStep2(userId: string, dto: Step2Dto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

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

    user.specialization = {
      categoryId: new Types.ObjectId(dto.categoryId),
      serviceIds: dto.serviceIds.map((id) => new Types.ObjectId(id)),
    };
    user.currentStep = 2;
    await user.save();

    return {
      message: 'Step 2 completed',
      currentStep: user.currentStep,
    };
  }

  async updateStep3(userId: string, dto: Step3Dto) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { ...dto, currentStep: 3 },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return { message: 'Step 3 completed', currentStep: user.currentStep };
  }

  async updateStep4(userId: string, dto: Step4Dto) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { ...dto, currentStep: 4 },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return { message: 'Step 4 completed', currentStep: user.currentStep };
  }

  async updateStep5(
    userId: string,
    files: {
      personalImage?: string;
      idFrontImage?: string;
      idBackImage?: string;
      certificateImage?: string | undefined;
      criminalRecordImage?: string | undefined;
    },
  ) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        ...files,
        currentStep: 5,
        isProfileComplete: true,
        verificationStatus: 'pending',
      },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return {
      message: 'Registration complete! Awaiting verification.',
      isProfileComplete: user.isProfileComplete,
      verificationStatus: user.verificationStatus,
    };
  }

  async getTechData(userId: string) {
    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) throw new NotFoundException('User not found');
    if (user.currentStep !== 5)
      throw new BadRequestException('Registration not completed');
    return {
      message: 'Technician data fetched successfully',
      data: this.toTechnicianDataDto(user),
    };
  }
}
