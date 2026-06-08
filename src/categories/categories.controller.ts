/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RoleDecorator } from 'src/common/decorators/role.decorator';
import { UserRole } from 'src/users/schemas/user.schema';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  //* ── Public (read only) ───────────────────────────────────────────────
  @ApiOperation({ summary: 'Get all active categories' })
  @Get()
  async findAll() {
    const data = await this.categoriesService.findAll();
    return { message: 'Categories fetched successfully', data };
  }

  // GET /api/categories/:id
  @ApiOperation({ summary: 'Get category by ID' })
  @Get(':id')
  async findOne(@Param('id', ParseMongoIdPipe) id: string) {
    const data = await this.categoriesService.findOne(id);
    return { message: 'Category fetched successfully', data };
  }

  //* ── Admin only (write) ───────────────────────────────────────────────
  @ApiOperation({ summary: '[Admin] Create a new category' })
  @ApiBearerAuth('JWT')
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @RoleDecorator(UserRole.ADMIN)
  async create(@Body() dto: CreateCategoryDto) {
    const data = await this.categoriesService.create(dto);
    return { message: 'Category created successfully', data };
  }

  @ApiOperation({ summary: '[Admin] Update category' })
  @ApiBearerAuth('JWT')
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @RoleDecorator(UserRole.ADMIN)
  async update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const data = await this.categoriesService.update(id, dto);
    return { message: 'Category updated successfully', data };
  }

  // PATCH /api/categories/:id/toggle-active
  @ApiOperation({ summary: '[Admin] Toggle category active/inactive' })
  @ApiBearerAuth('JWT')
  @Patch(':id/toggle-active')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @RoleDecorator(UserRole.ADMIN)
  async toggleActive(@Param('id', ParseMongoIdPipe) id: string) {
    const data = await this.categoriesService.toggleActive(id);
    return {
      message: `Category is now ${data.isActive ? 'active' : 'inactive'}`,
      data,
    };
  }

  // DELETE /api/categories/:id
  @ApiOperation({ summary: '[Admin] Delete category' })
  @ApiBearerAuth('JWT')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @RoleDecorator(UserRole.ADMIN)
  async remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
