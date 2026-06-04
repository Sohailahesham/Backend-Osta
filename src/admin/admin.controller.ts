import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Get('technicians/pending')
  @UseGuards(AuthGuard('jwt'))
  getPendingTechnicians() {
    return this.adminService.getPendingTechnicians();
  }
}
