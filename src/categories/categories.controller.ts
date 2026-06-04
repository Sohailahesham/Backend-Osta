import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // POST /api/categories
  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    const data = await this.categoriesService.create(dto);
    return { message: 'Category created successfully', data };
  }

  // GET /api/categories
  @Get()
  async findAll() {
    const data = await this.categoriesService.findAll();
    return { message: 'Categories fetched successfully', data };
  }

  // GET /api/categories/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.categoriesService.findOne(id);
    return { message: 'Category fetched successfully', data };
  }

  // PATCH /api/categories/:id
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const data = await this.categoriesService.update(id, dto);
    return { message: 'Category updated successfully', data };
  }

  // PATCH /api/categories/:id/toggle-active
  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    const data = await this.categoriesService.toggleActive(id);
    return { message: `Category is now ${data.isActive ? 'active' : 'inactive'}`, data };
  }

  // DELETE /api/categories/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
