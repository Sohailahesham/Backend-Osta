/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Register a new client account',
    description:
      'Create a new client account with email, password, and personal information.',
  })
  @ApiResponse({
    status: 201,
    description: 'Client registered successfully',
    schema: {
      example: {
        success: true,
        message: 'User registered successfully',
        data: {
          id: '60d5ec49c1234567890abc12',
          fullName: 'Ahmed Mohamed',
          email: 'client@example.com',
          phone: '20123456789',
          role: 'client',
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or email already exists',
    schema: {
      example: {
        success: false,
        message: 'Validation failed',
        data: {
          errors: [{ field: 'email', message: 'Email already registered' }],
        },
      },
    },
  })
  @Post('register/user')
  registerClient(@Body() dto: RegisterDto) {
    return this.authService.registerClient(dto);
  }

  @ApiOperation({
    summary: 'Register a new technician account',
    description:
      'Create a new technician account. After registration, complete the 5-step verification process.',
  })
  @ApiResponse({
    status: 201,
    description: 'Technician registered successfully',
    schema: {
      example: {
        success: true,
        message: 'Technician registered successfully',
        data: {
          id: '60d5ec49c1234567890abc13',
          fullName: 'Karim Hassan',
          email: 'technician@example.com',
          role: 'technician',
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @Post('register/technician')
  registerTechnician(@Body() dto: RegisterDto) {
    return this.authService.registerTechnician(dto);
  }

  @ApiOperation({
    summary: 'Authenticate user with email and password',
    description: 'Login using registered email and password credentials.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: '60d5ec49c1234567890abc12',
            fullName: 'Ahmed Mohamed',
            email: 'client@example.com',
            role: 'client',
            isVerified: true,
          },
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
  })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({
    summary: 'Get new access token using refresh token',
    description: 'Obtain a new access token using a valid refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      example: {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  @ApiOperation({
    summary: 'Logout and invalidate refresh token',
    description:
      'Logout from current session and invalidate the refresh token.',
  })
  @ApiBearerAuth('JWT')
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      example: {
        success: true,
        message: 'Logged out successfully',
        data: null,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  logout(@Req() req) {
    return this.authService.logout(req.user.userId);
  }

  @ApiOperation({
    summary: 'Get current authenticated user',
    description: 'Returns the currently authenticated user and verification state.',
  })
  @ApiBearerAuth('JWT')
  @ApiResponse({ status: 200, description: 'Current user fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req) {
    return this.authService.getCurrentUser(req.user.userId);
  }

  @ApiOperation({
    summary: 'Request password reset via OTP',
    description: 'Send OTP code to registered email for password reset.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    schema: {
      example: {
        success: true,
        message: 'OTP sent to your email',
        data: { email: 'client@example.com' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post('forget-password')
  forgetPassword(@Body() dto: ForgetPasswordDto) {
    return this.authService.forgetPassword(dto);
  }

  @ApiOperation({
    summary: 'Verify OTP code',
    description: 'Verify the OTP code sent to email.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    schema: {
      example: {
        success: true,
        message: 'OTP verified successfully',
        data: { resetToken: 'temp_token_xyz', expiresIn: 600 },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @ApiOperation({
    summary: 'Reset password using verified OTP',
    description: 'Update password after OTP verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      example: {
        success: true,
        message: 'Password reset successfully',
        data: { email: 'client@example.com' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @ApiOperation({
    summary: 'Send email verification link',
    description:
      'Send verification email link to authenticated user to verify their email address.',
  })
  @ApiBearerAuth('JWT')
  @ApiResponse({
    status: 200,
    description: 'Verification email sent',
    schema: {
      example: {
        success: true,
        message: 'Verification email sent successfully',
        data: { email: 'client@example.com' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('send-verification')
  @UseGuards(AuthGuard('jwt'))
  sendVerification(@Req() req) {
    return this.authService.sendVerificationEmail(req.user.userId);
  }

  @ApiOperation({
    summary: 'Verify email address via token',
    description: 'Click link in verification email to verify email address.',
  })
  @ApiQuery({
    name: 'token',
    description: 'Email verification token from email link',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully (returns HTML page)',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Res() res: express.Response,
  ) {
    const html = await this.authService.verifyEmail(token);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @ApiOperation({
    summary: 'Redirect to Google OAuth consent screen',
    description: 'Initiates Google OAuth 2.0 authentication flow.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google login',
  })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    //* redirect to Google
  }

  @ApiOperation({
    summary: 'Google OAuth callback handler',
    description: 'Handles OAuth callback from Google and returns auth tokens.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to frontend with tokens in query parameters',
  })
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
