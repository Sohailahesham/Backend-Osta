import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto, AddCommentDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // POST /services
  @Post()
  async create(@Body() dto: CreateServiceDto) {
    const data = await this.servicesService.create(dto);
    return { message: 'Service created successfully', data };
  }

  // GET /services?categoryId=xxx
  @Get()
  async findAll(@Query('categoryId') categoryId?: string) {
    const data = await this.servicesService.findAll(categoryId);
    return { message: 'Services fetched successfully', data };
  }
  // GET /services/most-common
  @Get('most-common')
  async getMostCommon() {
    const data = await this.servicesService.findMostCommon();
    return { message: 'Most common services fetched successfully', data };
  }

  // GET /services/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.servicesService.findOne(id);
    return { message: 'Service fetched successfully', data };
  }

  // PATCH /services/:id
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    const data = await this.servicesService.update(id, dto);
    return { message: 'Service updated successfully', data };
  }

  // PATCH /services/:id/toggle-active
  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    const data = await this.servicesService.toggleActive(id);
    return {
      message: `Service is now ${data.isActive ? 'active' : 'inactive'}`,
      data,
    };
  }

  // DELETE /services/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  // GET /services/:id/comments
  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    const data = await this.servicesService.getComments(id);
    return { message: 'Comments fetched successfully', data };
  }

  // POST /services/:id/comments
  @Post(':id/comments')
  async addComment(@Param('id') id: string, @Body() dto: AddCommentDto) {
    const data = await this.servicesService.addComment(id, dto);
    return { message: 'Comment added successfully', data };
  }

  // DELETE /services/:serviceId/comments/:commentId
  @Delete(':serviceId/comments/:commentId')
  @HttpCode(HttpStatus.OK)
  async removeComment(
    @Param('serviceId') serviceId: string,
    @Param('commentId') commentId: string,
  ) {
    const data = await this.servicesService.removeComment(serviceId, commentId);
    return { message: 'Comment deleted successfully', data };
  }
}
