import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<CategoryDocument> {
    const existing = await this.categoryModel.findOne({ key: dto.key.toUpperCase() });
    if (existing) throw new ConflictException(`Category with key "${dto.key}" already exists`);
    return new this.categoryModel(dto).save();
  }

  async findAll() {
    return this.categoryModel.find().sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(id).lean();
    if (!category) throw new NotFoundException(`Category #${id} not found`);
    return category as CategoryDocument;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDocument> {
    const updated = await this.categoryModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .lean();
    if (!updated) throw new NotFoundException(`Category #${id} not found`);
    return updated as CategoryDocument;
  }

  async remove(id: string) {
    const deleted = await this.categoryModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException(`Category #${id} not found`);
    return { message: 'Category deleted successfully' };
  }

  async toggleActive(id: string): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException(`Category #${id} not found`);
    category.isActive = !category.isActive;
    return category.save();
  }

  // called by ServicesService when a service is created or deleted
  async updateServicesCount(categoryId: string, delta: 1 | -1) {
    await this.categoryModel.findByIdAndUpdate(categoryId, {
      $inc: { servicesCount: delta },
    });
  }
}