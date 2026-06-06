import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestPaginationDto } from './dto/request-pagination.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RoleDecorator as Roles } from '../common/decorators/role.decorator';
import { UserRole } from 'src/users/schemas/user.schema';
import { CancelRequestDto } from './dto/cancel-request.dto';

@Controller('requests')
@UseGuards(AuthGuard('jwt'))
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  // POST /requests — CLIENT only
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CLIENT)
  async create(@Body() dto: CreateRequestDto, @Req() req: Request) {
    return this.requestService.create((req as any).user.userId, dto);
  }

  // GET /requests — ADMIN only
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query() paginationDto: RequestPaginationDto) {
    return this.requestService.findAll(paginationDto);
  }

  // GET /requests/pending — TECHNICIAN + ADMIN
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECHNICIAN, UserRole.ADMIN)
  async findAllPending(@Query() paginationDto: RequestPaginationDto) {
    return this.requestService.findAllPending(paginationDto);
  }

  // GET /requests/my — CLIENT only
  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CLIENT)
  async findMyRequests(
    @Query() paginationDto: RequestPaginationDto,
    @Req() req: Request,
  ) {
    return this.requestService.findMyRequests(
      (req as any).user.userId,
      paginationDto,
    );
  }

  // GET /requests/assigned — TECHNICIAN + ADMIN
  @Get('assigned')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECHNICIAN, UserRole.ADMIN)
  async findAssignedRequests(
    @Query() paginationDto: RequestPaginationDto,
    @Req() req: Request,
  ) {
    return this.requestService.findAssignedRequests(
      (req as any).user.userId,
      paginationDto,
    );
  }

  // GET /requests/:id — all logged in
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.requestService.findById(id);
  }

  // PATCH /requests/:id/accept — TECHNICIAN accepts a pending request
  @Patch(':id/accept')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECHNICIAN)
  async acceptRequest(@Param('id') id: string, @Req() req: Request) {
    return this.requestService.acceptRequest(id, (req as any).user.userId);
  }

  // PATCH /requests/:id/complete — TECHNICIAN completes their request
  @Patch(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECHNICIAN)
  async completeRequest(@Param('id') id: string, @Req() req: Request) {
    return this.requestService.completeRequest(id, (req as any).user.userId);
  }

  // PATCH /requests/:id/status — ADMIN only (override any status)
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Req() req: Request,
  ) {
    return this.requestService.updateStatus(id, dto);
  }

  // PATCH /requests/:id/cancel — CLIENT + TECHNICIAN + ADMIN

  @Patch(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelRequestDto,
    @Req() req: Request,
  ) {
    return this.requestService.cancel(
      id,
      (req as any).user.userId,
      (req as any).user.role,
      dto.reason,
    );
  }

  // DELETE /requests/:id — ADMIN only
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.requestService.delete(id);
  }
}
