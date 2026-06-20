import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class VerifiedEmailGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.userId;

    if (!userId) {
      throw new ForbiddenException('Authentication is required');
    }

    const user = await this.userModel.findById(userId).select('isVerified');
    if (!user?.isVerified) {
      throw new ForbiddenException(
        'Please verify your email before continuing registration',
      );
    }

    return true;
  }
}
