import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import * as express from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgetPasswordDto } from './dto/forgetPass.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-pass.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/user')
  registerClient(@Body() dto: RegisterDto) {
    return this.authService.registerClient(dto);
  }

  @Post('register/technician')
  registerTechnician(@Body() dto: RegisterDto) {
    return this.authService.registerTechnician(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  logout(@Req() req) {
    return this.authService.logout(req.user.userId);
  }

  @Post('forget-password')
  forgetPassword(@Body() dto: ForgetPasswordDto) {
    return this.authService.forgetPassword(dto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('send-verification')
  @UseGuards(AuthGuard('jwt'))
  sendVerification(@Req() req) {
    return this.authService.sendVerificationEmail(req.user.userId);
  }

  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Res() res: express.Response,
  ) {
    const html = await this.authService.verifyEmail(token);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    //* redirect to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req, @Res() res: express.Response) {
    const { access_token, refresh_token } = req.user;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(
      `${frontendUrl}/auth/callback?access_token=${access_token}&refresh_token=${refresh_token}`,
    );
  }
}
