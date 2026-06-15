/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  MainRequest,
  RequestDocument,
} from 'src/request/schemas/request.schema';
import { RequestStatus } from 'src/request/enums/request-status.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(MainRequest.name)
    private readonly requestModel: Model<RequestDocument>,
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

  async getDashboard(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const [stats, recentRequests, activeRequest] = await Promise.all([
      //* request stats by status
      this.requestModel.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      //* recent requests
      this.requestModel
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('categoryId', 'name image')
      // .populate('serviceId', 'title price')
      .populate('serviceId', 'name priceRange')
      // .select('title status preferredDate preferredTime createdAt')
      .select('title status preferredDate preferredTime createdAt address categoryId serviceId')
      .lean(),

      //* active request
      this.requestModel
      .findOne({ userId: userObjectId, status: RequestStatus.IN_PROGRESS })
      .populate('categoryId', 'name image')
      .populate('serviceId', 'name priceRange')
      .populate('assignedTechnician', 'fullName phone')
      .lean(),
    ]);


    //* calculate stats
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
      message: 'User Dashboard retrieved successfully',
      data: {
        stats: counts,
        activeRequest: activeRequest ?? null,
        recentRequests,
      },
    };
  }
}
