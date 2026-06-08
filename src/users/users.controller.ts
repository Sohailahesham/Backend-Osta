/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Get authenticated user profile',
    description:
      'Retrieve complete profile information of the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          id: '60d5ec49c1234567890abc12',
          fullName: 'Ahmed Mohamed',
          email: 'client@example.com',
          phone: '20123456789',
          governorate: 'Cairo',
          city: 'Giza',
          gender: 'MALE',
          role: 'client',
          isVerified: true,
          createdAt: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @Get('me')
  getMe(@Req() req) {
    return this.usersService.getMe(req.user.userId);
  }

  @ApiOperation({
    summary: 'Update user profile',
    description:
      'Update profile information. All fields are optional - only provide fields to update.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: '60d5ec49c1234567890abc12',
          fullName: 'Ahmed Mohamed Updated',
          email: 'client@example.com',
          phone: '20123456789',
          governorate: 'Alexandria',
          city: 'Alexandria',
          gender: 'MALE',
          role: 'client',
          isVerified: true,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Patch('me')
  updateMe(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateMe(req.user.userId, dto);
  }

  @ApiOperation({
    summary: 'Get user dashboard data',
    description:
      'Retrieve dashboard data for the authenticated user. This endpoint requires authentication and authorization to access.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: {
          totalRequests: 5,
          recentRequests: [
            {
              id: '60d5ec49c1234567890abc12',
              title: 'Request 1',
              status: 'pending',
              preferredDate: '2024-01-15',
              preferredTime: '10:00',
              createdAt: '2024-01-15T10:30:00.000Z',
            },
            {
              id: '60d5ec49c1234567890abc13',
              title: 'Request 2',
              status: 'in-progress',
              preferredDate: '2024-01-16',
              preferredTime: '11:00',
              createdAt: '2024-01-16T11:00:00.000Z',
            },
            {
              id: '60d5ec49c1234567890abc14',
              title: 'Request 3',
              status: 'completed',
              preferredDate: '2024-01-17',
              preferredTime: '12:00',
              createdAt: '2024-01-17T12:00:00.000Z',
            },
          ],
          activeRequest: {
            id: '60d5ec49c1234567890abc15',
            title: 'Request 4',
            status: 'in-progress',
            preferredDate: '2024-01-18',
            preferredTime: '13:00',
            createdAt: '2024-01-18T13:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  @Get('dashboard')
  getDashboard(@Req() req) {
    return this.usersService.getDashboard(req.user.userId);
  }
}
