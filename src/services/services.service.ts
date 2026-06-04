import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ServiceEntity, ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto, AddCommentDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(ServiceEntity.name)
    private serviceModel: Model<ServiceDocument>,
    private categoriesService: CategoriesService,
  ) {}

  async create(dto: CreateServiceDto): Promise<ServiceDocument> {
    // validate category exists
    await this.categoriesService.findOne(dto.category);

    const existing = await this.serviceModel.findOne({
      key: dto.key.toUpperCase(),
    });
    if (existing)
      throw new ConflictException(
        `Service with key "${dto.key}" already exists`,
      );

    if (dto.priceRange.min > dto.priceRange.max)
      throw new BadRequestException(
        'priceRange.min cannot be greater than max',
      );

    const service = await new this.serviceModel(dto).save();

    // increment category servicesCount by 1
    await this.categoriesService.updateServicesCount(dto.category, 1);

    return service;
  }

  async findAll(categoryId?: string) {
    const filter: any = {};
    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId))
        throw new BadRequestException('Invalid categoryId');
      filter.category = new Types.ObjectId(categoryId);
    }
    return this.serviceModel
      .find(filter)
      .populate('category', 'key name image')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findOne(id: string): Promise<ServiceDocument> {
    const service = await this.serviceModel
      .findById(id)
      .populate('category', 'key name image')
      .lean();
    if (!service) throw new NotFoundException(`Service #${id} not found`);
    return service as ServiceDocument;
  }

  async update(id: string, dto: UpdateServiceDto): Promise<ServiceDocument> {
    if (dto.category) await this.categoriesService.findOne(dto.category);

    if (dto.priceRange?.min !== undefined && dto.priceRange?.max !== undefined)
      if (dto.priceRange.min > dto.priceRange.max)
        throw new BadRequestException(
          'priceRange.min cannot be greater than max',
        );

    const updated = await this.serviceModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .populate('category', 'key name image')
      .lean();

    if (!updated) throw new NotFoundException(`Service #${id} not found`);
    return updated as ServiceDocument;
  }

  async remove(id: string) {
    const deleted = await this.serviceModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException(`Service #${id} not found`);

    // decrement category servicesCount by 1
    await this.categoriesService.updateServicesCount(
      deleted.category.toString(),
      -1,
    );

    return { message: 'Service deleted successfully' };
  }

  async toggleActive(id: string): Promise<ServiceDocument> {
    const service = await this.serviceModel.findById(id);
    if (!service) throw new NotFoundException(`Service #${id} not found`);
    service.isActive = !service.isActive;
    return service.save();
  }

  async getComments(id: string) {
    const service = await this.serviceModel
      .findById(id)
      .select('comments averageRating totalRatings')
      .lean();
    if (!service) throw new NotFoundException(`Service #${id} not found`);
    return {
      comments: service.comments,
      averageRating: service.averageRating,
      totalRatings: service.totalRatings,
    };
  }

  async addComment(id: string, dto: AddCommentDto): Promise<ServiceDocument> {
    const service = await this.serviceModel.findById(id);
    if (!service) throw new NotFoundException(`Service #${id} not found`);

    (service.comments as any[]).push({ ...dto, createdAt: new Date() });

    const total = service.comments!.length;
    const sum = (service.comments as any[]).reduce(
      (acc, c) => acc + c.rating,
      0,
    );
    service.averageRating = Math.round((sum / total) * 10) / 10;
    service.totalRatings = total;

    return service.save();
  }

  async removeComment(
    serviceId: string,
    commentId: string,
  ): Promise<ServiceDocument> {
    const service = await this.serviceModel.findById(serviceId);
    if (!service)
      throw new NotFoundException(`Service #${serviceId} not found`);

    const index = (service.comments as any[]).findIndex(
      (c) => c._id?.toString() === commentId,
    );
    if (index === -1)
      throw new NotFoundException(`Comment #${commentId} not found`);

    (service.comments as any[]).splice(index, 1);

    const total = service.comments!.length;
    service.averageRating =
      total > 0
        ? Math.round(
            ((service.comments as any[]).reduce((acc, c) => acc + c.rating, 0) /
              total) *
              10,
          ) / 10
        : 0;
    service.totalRatings = total;

    return service.save();
  }
  async findMostCommon(): Promise<ServiceDocument[]> {
    return this.serviceModel
      .find({ isActive: true })
      .populate('category', 'key name image')
      .sort({ totalRatings: -1 })
      .limit(6)
      .lean() as unknown as ServiceDocument[];
  }
}
