import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getMe(userId: string) {
    const user = await this.userModel
    .findById(userId)
    .select(
      '-password -refreshToken -otp -otpExpires -verificationToken -verificationTokenExpires',
    )
    .lean();

    if (!user) throw new NotFoundException('User not found');

    return { message: 'Profile retrieved successfully', data: user };
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel
    .findByIdAndUpdate(userId, dto, { new: true })
    .select(
      '-password -refreshToken -otp -otpExpires -verificationToken -verificationTokenExpires',
    )
    .lean();

    if (!user) throw new NotFoundException('User not found');

    return { message: 'Profile updated successfully', data: user };
  }
}
