import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AuthProvider,
  User,
  UserDocument,
  UserRole,
} from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto } from './dto/reset-pass.dto';
import { MailService } from 'src/mail/mail.service';
import { ForgetPasswordDto } from './dto/forgetPass.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { randomBytes } from 'crypto';
import {
  Technician,
  TechnicianDocument,
} from '../technician/schemas/technician.schema';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Technician.name)
    private technicianModel: Model<TechnicianDocument>,
    private jwtService: JwtService,
    private mailService: MailService,
    private walletService: WalletService,
  ) {}

  private getRefreshSecret() {
    return process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  }

  private isClientProfileComplete(user: UserDocument) {
    return Boolean(
      user.fullName &&
        user.email &&
        user.phone &&
        user.governorate &&
        user.city &&
        user.gender,
    );
  }

  private async buildAuthUser(user: UserDocument) {
    let technicianData: {
      currentStep: number;
      isProfileComplete: boolean;
      verificationStatus: string;
    } | null = null;

    if (user.role === UserRole.TECHNICIAN) {
      const technician = await this.technicianModel.findOne({
        userId: user._id,
      });
      technicianData = {
        currentStep: technician?.currentStep ?? 1,
        isProfileComplete: technician?.isProfileComplete ?? false,
        verificationStatus: technician?.verificationStatus ?? 'incomplete',
      };
    }

    return {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      provider: user.provider,
      isVerified: user.isVerified,
      profileComplete:
        user.role === UserRole.CLIENT ? this.isClientProfileComplete(user) : true,
      ...(technicianData && { technicianData }),
    };
  }

  private async issueVerificationToken(userId: string) {
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userModel.findByIdAndUpdate(userId, {
      verificationToken: token,
      verificationTokenExpires: expires,
    });

    return token;
  }

  private async sendVerificationEmailToUser(user: UserDocument) {
    if (user.isVerified) return;
    const token = await this.issueVerificationToken(user._id.toString());
    await this.mailService.sendVerificationEmail(user.email, token);
  }

  private async signTokens(user: UserDocument) {
    const payload = { sub: user._id, email: user.email, role: user.role };

    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.getRefreshSecret(),
      expiresIn: '7d',
    });

    const hashed = await bcrypt.hash(refresh_token, 10);
    await this.userModel.findByIdAndUpdate(user._id, { refreshToken: hashed });

    return {
      access_token,
      refresh_token,
      user: await this.buildAuthUser(user),
    };
  }

  async registerClient(dto: RegisterDto) {
    try {
      await this.checkEmail(dto.email);
      this.checkPasswords(dto.password, dto.confirmPassword);

      const hashed = await bcrypt.hash(dto.password, 10);
      const user = await this.userModel.create({
        fullName: dto.fullName,
        email: dto.email,
        password: hashed,
        phone: dto.phone,
        role: UserRole.CLIENT,
        governorate: dto.governorate,
        city: dto.city,
        gender: dto.gender,
      });

      await this.sendVerificationEmailToUser(user);

      return this.signTokens(user);
    } catch (error: any) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new BadRequestException(`${field} already exists`);
      }
      throw error;
    }
  }

  async registerTechnician(dto: RegisterDto) {
    try {
      await this.checkEmail(dto.email);
      this.checkPasswords(dto.password, dto.confirmPassword);
      const hashed = await bcrypt.hash(dto.password, 10);
      const user = await this.userModel.create({
        fullName: dto.fullName,
        email: dto.email,
        password: hashed,
        phone: dto.phone,
        role: UserRole.TECHNICIAN,
        governorate: dto.governorate,
        city: dto.city,
        gender: dto.gender,
      } as any);

      await this.technicianModel.create({ userId: user._id } as any);
      await this.walletService.createWallet(user._id.toString());
      await this.sendVerificationEmailToUser(user);
      return this.signTokens(user);
    } catch (error: any) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new BadRequestException(`${field} already exists`);
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    // sign with google
    if (!user.password)
      throw new UnauthorizedException('Invalid email or password');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid email or password');
    return this.signTokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.getRefreshSecret(),
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user || !user.refreshToken)
        throw new UnauthorizedException('Invalid refresh token');

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) throw new UnauthorizedException('Invalid refresh token');

      return this.signTokens(user);
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError')
        throw new UnauthorizedException(
          'Refresh token expired, please login again',
        );

      if (error?.name === 'JsonWebTokenError')
        throw new UnauthorizedException('Invalid refresh token');

      throw error;
    }
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  async findOrCreateGoogleUser(data: {
    email: string;
    fullName: string;
    googleId: string;
  }) {
    //* check if user already exists with googleId
    let user = await this.userModel.findOne({ googleId: data.googleId });
    if (user) return this.signTokens(user);

    //* check if user exists with email
    user = await this.userModel.findOne({ email: data.email });
    if (user) {
      user.googleId = data.googleId;
      user.provider = AuthProvider.GOOGLE;
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();
      return this.signTokens(user);
    }

    //* create new user
    const newUser = await this.userModel.create({
      fullName: data.fullName,
      email: data.email,
      googleId: data.googleId,
      provider: AuthProvider.GOOGLE,
      isVerified: true,
      role: UserRole.CLIENT,
    });

    return this.signTokens(newUser);
  }

  private async checkEmail(email: string) {
    const exists = await this.userModel.findOne({ email });
    if (exists) throw new BadRequestException('Email already exists');
  }

  private checkPasswords(pass: string, confirm: string) {
    if (pass !== confirm)
      throw new BadRequestException('Passwords do not match');
  }

  async forgetPassword(dto: ForgetPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new NotFoundException('Email not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await this.userModel.findByIdAndUpdate(user._id, { otp, otpExpires });
    await this.mailService.sendOtp(user.email, otp);

    return { message: 'OTP sent to your email', data: null };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new NotFoundException('Email not found');

    if (user.otp !== dto.otp) throw new BadRequestException('Invalid OTP');

    if (user.otpExpires! < new Date())
      throw new BadRequestException('OTP expired');

    await this.userModel.findByIdAndUpdate(user._id, {
      otp: null,
      otpExpires: null,
    });

    return { message: 'OTP verified successfully', data: null };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword)
      throw new BadRequestException('Passwords do not match');

    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new NotFoundException('Email not found');
    if (user.otp || user.otpExpires)
      throw new BadRequestException('Please verify OTP first');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.userModel.findByIdAndUpdate(user._id, { password: hashed });

    return { message: 'Password reset successfully', data: null };
  }

  async sendVerificationEmail(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.isVerified)
      throw new BadRequestException('Email already verified');
    await this.sendVerificationEmailToUser(user);
    return { message: 'Verification email sent successfully' };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return {
      message: 'User fetched successfully',
      data: await this.buildAuthUser(user),
    };
  }

  async verifyEmail(token: string) {
    const user = await this.userModel.findOne({ verificationToken: token });
    if (!user) return this.mailService.getVerifiedHtml(false);
    if (user.verificationTokenExpires! < new Date())
      return this.mailService.getVerifiedHtml(false);

    await this.userModel.findByIdAndUpdate(user._id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    });

    return this.mailService.getVerifiedHtml(true);
  }
}
