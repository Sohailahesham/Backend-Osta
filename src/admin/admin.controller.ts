/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/users/schemas/user.schema';
import { RoleDecorator } from 'src/common/decorators/role.decorator';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { RejectTechnicianDto } from './dto/reject-technician.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth('JWT')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@RoleDecorator(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Get all users (paginated, filter by role)' })
  @Get('users')
  getAllUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.getAllUsers(query);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @Get('users/:id')
  getUser(@Param('id', ParseMongoIdPipe) id: string) {
    return this.adminService.getUserById(id);
  }

  @ApiOperation({ summary: 'Get pending technicians (paginated)' })
  @Get('technicians/pending')
  getPendingTechnicians(@Query() query: PaginationDto) {
    return this.adminService.getPendingTechnicians(query);
  }

  @ApiOperation({ summary: 'Get technician by ID' })
  @Get('technicians/:id')
  getTechnician(@Param('id', ParseMongoIdPipe) id: string) {
    return this.adminService.getTechnicianById(id);
  }

  @ApiOperation({ summary: 'Approve technician' })
  @Patch('technicians/:id/approve')
  approveTechnician(@Param('id', ParseMongoIdPipe) id: string) {
    return this.adminService.approveTechnician(id);
  }

  @ApiOperation({ summary: 'Reject technician with reason' })
  @Patch('technicians/:id/reject')
  rejectTechnician(@Param('id') id: string, @Body() dto: RejectTechnicianDto) {
    return this.adminService.rejectTechnician(id, dto.reason);
  }

  @ApiOperation({ summary: 'Get all technicians (paginated)' })
  @Get('technicians')
  getAllTechnicians(@Query() query: PaginationDto) {
    return this.adminService.getAllTechnicians(query);
  }

  @ApiOperation({ summary: 'Promote user to admin role' })
  @Patch('users/:id/set-admin-role')
  setAdminRole(@Param('id', ParseMongoIdPipe) id: string) {
    return this.adminService.setAdminRole(id);
  }

  @ApiOperation({ summary: 'Get dashboard data' })
  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }
}
