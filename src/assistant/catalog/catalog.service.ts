import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from 'src/users/schemas/user.schema';
import { ServicesService } from 'src/services/services.service';
import { CategoriesService } from 'src/categories/categories.service';
import {
  Technician,
  TechnicianDocument,
  VerificationStatus,
} from 'src/technician/schemas/technician.schema';

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Technician.name)
    private readonly technicianModel: Model<TechnicianDocument>,
    private readonly servicesService: ServicesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  /**
   * Returns all active services from MongoDB.
   * Each service has { _id, key, name, description, category (populated) }.
   */
  async getServices() {
    return this.servicesService.findAll();
  }

  /**
   * Resolves the AI-returned category string (e.g. "plumbing") to a real
   * Category document by matching the `key` field (stored uppercase, e.g. "PLUMBING"),
   * then queries approved technicians whose specialization references that category.
   */
  async getTechnicians(categorySlug: string) {
    // 1. Find the category by key (stored uppercase in DB)
    const allCategories = await this.categoriesService.findAll();
    const category = allCategories.find(
      (c) => c.key.toLowerCase() === categorySlug.toLowerCase(),
    );
    console.log('categorySlug:', categorySlug);
    console.log('allCategories:', allCategories);

    if (!category) return [];

    const categoryId = (category as any)._id as Types.ObjectId;

    // 2. Query approved, available technicians specialised in this category

    const technicians = await this.technicianModel
    .find({
      verificationStatus: VerificationStatus.APPROVED,
      isAvailable: true,
        'specialization.categoryId': categoryId,
      })
      .populate('userId', 'fullName')
      .select('averageRating totalReviews serviceAreas personalImage')
      .lean();

    return technicians.map((t) => ({
      id: (t as any)._id,
      name: (t.userId as any)?.fullName,
      rating: t.averageRating,
      totalReviews: t.totalReviews,
      serviceAreas: t.serviceAreas,
      image: t.personalImage,
    }));
  }
}
