import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Step2Dto } from './dto/step2.dto';
import { Step3Dto } from './dto/step3.dto';
import { Step4Dto } from './dto/step4.dto';

@Injectable()
export class TechnicianService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async updateStep2(userId: string, dto: Step2Dto) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { ...dto, currentStep: 2 },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return { message: 'Step 2 completed', currentStep: user.currentStep };
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
      idImage?: string;
      certificateImage?: string;
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
}