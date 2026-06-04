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

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@RoleDecorator(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Get('users')
  getAllUsers(@Query('role') role?: UserRole) {
    return this.adminService.getAllUsers(role);
  }

  @Get('technicians/pending')
  getPendingTechnicians() {
    return this.adminService.getPendingTechnicians();
  }

  @Get('technicians/:id')
  getTechnician(@Param('id', ParseMongoIdPipe) id: string) {
    return this.adminService.getTechnicianById(id);
  }

  @Patch('technicians/:id/approve')
  approveTechnician(@Param('id', ParseMongoIdPipe) id: string) {
    return this.adminService.approveTechnician(id);
  }

  @Patch('technicians/:id/reject')
  rejectTechnician(@Param('id') id: string, @Body() dto: RejectTechnicianDto) {
    return this.adminService.rejectTechnician(id, dto.reason);
  }
}
