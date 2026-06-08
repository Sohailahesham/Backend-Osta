/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ServicesService } from './services.service';
import { CreateServiceDto, AddCommentDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RoleDecorator } from 'src/common/decorators/role.decorator';
import { UserRole } from 'src/users/schemas/user.schema';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  //* ── Public (read only) ───────────────────────────────────────────────
  @ApiOperation({ summary: 'Get all services (filter by categoryId)' })
  @ApiQuery({ name: 'categoryId', required: false })
  @Get()
  async findAll(@Query('categoryId') categoryId?: string) {
    const data = await this.servicesService.findAll(categoryId);
    return { message: 'Services fetched successfully', data };
  }

  @ApiOperation({ summary: 'Get most common services (top 6)' })
  @Get('most-common')
  async getMostCommon() {
    const data = await this.servicesService.findMostCommon();
    return { message: 'Most common services fetched successfully', data };
  }

  // GET /services/:id
  @ApiOperation({ summary: 'Get service by ID' })
  @Get(':id')
  async findOne(@Param('id', ParseMongoIdPipe) id: string) {
    const data = await this.servicesService.findOne(id);
    return { message: 'Service fetched successfully', data };
  }

  @ApiOperation({ summary: 'Get service comments' })
  @Get(':id/comments')
  async getComments(@Param('id', ParseMongoIdPipe) id: string) {
    const data = await this.servicesService.getComments(id);
    return { message: 'Comments fetched successfully', data };
  }

  //* ── Admin only (write) ───────────────────────────────────────────────
  @ApiOperation({ summary: '[Admin] Create service' })
  @ApiBearerAuth('JWT')
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @RoleDecorator(UserRole.ADMIN)
  async create(@Body() dto: CreateServiceDto) {
    const data = await this.servicesService.create(dto);
    return { message: 'Service created successfully', data };
  }

  @ApiOperation({ summary: '[Admin] Update service' })
  @ApiBearerAuth('JWT')
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @RoleDecorator(UserRole.ADMIN)
  async update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    const data = await this.servicesService.update(id, dto);
    return { message: 'Service updated successfully', data };
  }

  // PATCH /services/:id/toggle-active
  @ApiOperation({ summary: '[Admin] Toggle service active/inactive' })
  @ApiBearerAuth('JWT')
  @Patch(':id/toggle-active')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @RoleDecorator(UserRole.ADMIN)
  async toggleActive(@Param('id', ParseMongoIdPipe) id: string) {
    const data = await this.servicesService.toggleActive(id);
    return {
      message: `Service is now ${data.isActive ? 'active' : 'inactive'}`,
      data,
    };
  }

  // DELETE /services/:id
  @ApiOperation({ summary: '[Admin] Delete service' })
  @ApiBearerAuth('JWT')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @RoleDecorator(UserRole.ADMIN)
  async remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.servicesService.remove(id);
  }

  //* ── Authenticated users (comments) ───────────────────────────────────
  @ApiOperation({ summary: 'Add comment to service (authenticated)' })
  @ApiBearerAuth('JWT')
  @Post(':id/comments')
  @UseGuards(AuthGuard('jwt'))
  async addComment(
    @Param('id', ParseMongoIdPipe) id: string,
    @Req() req,
    @Body() dto: AddCommentDto,
  ) {
    dto.userId = req.user.userId; // ← userId من الـ JWT مش من الـ body
    const data = await this.servicesService.addComment(id, dto);
    return { message: 'Comment added successfully', data };
  }

  // DELETE /services/:serviceId/comments/:commentId
  @ApiOperation({ summary: 'Delete comment from service' })
  @ApiBearerAuth('JWT')
  @Delete(':serviceId/comments/:commentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async removeComment(
    @Param('serviceId', ParseMongoIdPipe) serviceId: string,
    @Param('commentId', ParseMongoIdPipe) commentId: string,
  ) {
    const data = await this.servicesService.removeComment(serviceId, commentId);
    return { message: 'Comment deleted successfully', data };
  }
}
