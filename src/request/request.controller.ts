/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompleteRequestDto } from './dto/complete-request.dto';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@ApiTags('Requests')
@ApiBearerAuth('JWT')
@Controller('requests')
@UseGuards(AuthGuard('jwt'))
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  // POST /requests — CLIENT only
  @ApiOperation({ summary: '[Client] Create a new service request' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CLIENT)
  async create(@Body() dto: CreateRequestDto, @Req() req: Request) {
    return this.requestService.create((req as any).user.userId, dto);
  }

  // GET /requests — ADMIN only
  @ApiOperation({ summary: '[Admin] Get all requests (paginated)' })
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query() paginationDto: RequestPaginationDto) {
    return this.requestService.findAll(paginationDto);
  }

  // GET /requests/pending — TECHNICIAN
  @ApiOperation({ summary: '[Technician/Admin] Get pending requests' })
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECHNICIAN)
  async findAllPending(
    @Query() paginationDto: RequestPaginationDto,
    @Req() req: AuthRequest,
  ) {
    return this.requestService.findAllPending(paginationDto, req);
  }

  // GET /requests/my — CLIENT only
  @ApiOperation({ summary: '[Client] Get my requests' })
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
  @ApiOperation({ summary: '[Technician/Admin] Get assigned requests' })
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
  @ApiOperation({ summary: 'Get request by ID' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.requestService.findById(id);
  }

  // PATCH /requests/:id/accept — TECHNICIAN accepts a pending request
  @ApiOperation({ summary: '[Technician] Accept a pending request' })
  @Patch(':id/accept')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECHNICIAN)
  async acceptRequest(@Param('id') id: string, @Req() req: Request) {
    return this.requestService.acceptRequest(id, (req as any).user.userId);
  }

  // PATCH /requests/:id/on-the-way — TECHNICIAN ← جديد
  @ApiOperation({ summary: '[Technician] Mark as on the way' })
  @Patch(':id/on-the-way')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECHNICIAN)
  async onTheWay(@Param('id') id: string, @Req() req: Request) {
    return this.requestService.onTheWay(id, (req as any).user.userId);
  }

  // PATCH /requests/:id/start — TECHNICIAN ← جديد
  @ApiOperation({ summary: '[Technician] Mark as started' })
  @Patch(':id/start')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECHNICIAN)
  async startRequest(@Param('id') id: string, @Req() req: Request) {
    return this.requestService.startRequest(id, (req as any).user.userId);
  }

  // PATCH /requests/:id/complete — TECHNICIAN completes their request
  @ApiOperation({ summary: '[Technician] Mark request as complete' })
  @Patch(':id/complete')
  @UseGuards(AuthGuard('jwt'))
  completeRequest(
    @Param('id') id: string,
    @Body() dto: CompleteRequestDto,
    @Req() req,
  ) {
    return this.requestService.completeRequest(
      id,
      req.user.userId,
      dto.totalPrice,
      dto.completionNote,
    );
  }

  // PATCH /requests/:id/status — ADMIN only (override any status)
  @ApiOperation({ summary: '[Admin] Override request status' })
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
  @ApiOperation({ summary: 'Cancel a request (client/technician/admin)' })
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
  @ApiOperation({ summary: '[Admin] Delete a request' })
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.requestService.delete(id);
  }
}
