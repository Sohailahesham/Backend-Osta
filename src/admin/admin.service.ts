import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  UserDocument,
  UserRole,
  VerificationStatus,
} from 'src/users/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}
  async getPendingTechnicians() {
    return this.userModel.find({
      role: UserRole.TECHNICIAN,
      verificationStatus: VerificationStatus.PENDING,
    });
  }
}
