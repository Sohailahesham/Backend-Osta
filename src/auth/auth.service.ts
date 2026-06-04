import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async registerClient(dto: RegisterDto) {
    await this.checkEmail(dto.email);
    this.checkPasswords(dto.password, dto.confirmPassword);
    const hashed = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.userModel.create({
        fullName: dto.fullName,
        email: dto.email,
        password: hashed,
        phone: dto.phone,
        role: UserRole.CLIENT,
        city: dto.city,
        governorate: dto.governorate,
      });
      return this.signTokens(user);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'name' in error) {
        const err = error as any;

        if (err.name === 'ValidationError') {
          const messages = Object.values(err.errors).map((e: any) => e.message);

          throw new BadRequestException(messages);
        }
      }

      throw error;
    }
  }

  async registerTechnician(dto: RegisterDto) {
    await this.checkEmail(dto.email);
    this.checkPasswords(dto.password, dto.confirmPassword);

    const hashed = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.userModel.create({
        fullName: dto.fullName,
        email: dto.email,
        password: hashed,
        phone: dto.phone,
        role: UserRole.TECHNICIAN,
        currentStep: 1,
        city: dto.city,
        governorate: dto.governorate,
      });

      return this.signTokens(user);
    } catch (error: unknown) {
      const err = error as any;

      if (err?.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        throw new ConflictException(`${field} already exists`);
      }

      if (err?.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e: any) => e.message);
        throw new BadRequestException(messages);
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.signTokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user || !user.refreshToken)
        throw new UnauthorizedException('Invalid refresh token');

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) throw new UnauthorizedException('Invalid refresh token');

      return this.signTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  private async signTokens(user: UserDocument) {
    const payload = { sub: user._id, email: user.email, role: user.role };

    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'secret',
      expiresIn: '1d',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      expiresIn: '7d',
    });

    const hashed = await bcrypt.hash(refresh_token, 10);
    await this.userModel.findByIdAndUpdate(user._id, { refreshToken: hashed });

    return {
      access_token,
      refresh_token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        currentStep: user.currentStep ?? null,
      },
    };
  }

  private async checkEmail(email: string) {
    const exists = await this.userModel.findOne({ email });
    if (exists) throw new BadRequestException('Email already exists');
  }

  private checkPasswords(pass: string, confirm: string) {
    if (pass !== confirm)
      throw new BadRequestException('Passwords do not match');
  }
}
