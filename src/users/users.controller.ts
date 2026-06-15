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
      'Retrieve dashboard data for the authenticated user including stats, recent requests with category and service details, and the active in-progress request.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'User Dashboard retrieved successfully',
        data: {
          stats: {
            total: 5,
            pending: 2,
            inProgress: 1,
            completed: 2,
            cancelled: 0,
          },
          recentRequests: [
            {
              _id: '60d5ec49c1234567890abc12',
              title: 'Request 1',
              status: 'pending',
              preferredDate: '2024-01-15',
              preferredTime: '10:00',
              createdAt: '2024-01-15T10:30:00.000Z',
              address: {
                fullAddress: '123 Main Street, Cairo, Egypt',
                district: 'elgam3a',
                coordinates: { lat: 30.0444, lng: 31.2357 },
              },
              categoryId: {
                _id: '60d5ec49c1234567890abc20',
                name: 'السباكة',
                image: 'https://example.com/plumbing.jpg',
              },
              serviceId: {
                _id: '60d5ec49c1234567890abc21',
                name: 'إصلاح تسريب المياه',
                priceRange: { min: 150, max: 450 },
              },
            },
            {
              _id: '60d5ec49c1234567890abc13',
              title: 'Request 2',
              status: 'in-progress',
              preferredDate: '2024-01-16',
              preferredTime: '11:00',
              createdAt: '2024-01-16T11:00:00.000Z',
              address: {
                fullAddress: 'حي الأشجار، شارع عبدالعزيز، المنصورة',
                district: 'حي الأشجار',
                coordinates: { lat: 30.0444, lng: 31.2357 },
              },
              categoryId: {
                _id: '60d5ec49c1234567890abc22',
                name: 'الكهرباء',
                image: 'https://example.com/electric.jpg',
              },
              serviceId: {
                _id: '60d5ec49c1234567890abc23',
                name: 'تركيب مروحة سقف',
                priceRange: { min: 150, max: 300 },
              },
            },
          ],
          activeRequest: {
            _id: '60d5ec49c1234567890abc15',
            title: 'Request 4',
            status: 'in-progress',
            preferredDate: '2024-01-18',
            preferredTime: '13:00',
            createdAt: '2024-01-18T13:00:00.000Z',
            address: {
              fullAddress: '123 Main Street, Cairo, Egypt',
              district: 'elgam3a',
              coordinates: { lat: 30.0444, lng: 31.2357 },
            },
            categoryId: {
              _id: '60d5ec49c1234567890abc20',
              name: 'السباكة',
              image: 'https://example.com/plumbing.jpg',
            },
            serviceId: {
              _id: '60d5ec49c1234567890abc21',
              name: 'إصلاح تسريب المياه',
              priceRange: { min: 150, max: 450 },
            },
            assignedTechnician: {
              _id: '60d5ec49c1234567890abc30',
              fullName: 'محمد الشاذلي',
              phone: '01012345678',
            },
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