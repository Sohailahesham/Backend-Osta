import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { PlacesService } from './places.service';
import { MaintenanceShopsCacheService } from './maintenance-shops-cache.service';
import { MaintenanceShopsQueryDto } from './dto/maintenance-shops-query.dto';

const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 2; // 2 days

@Injectable()
export class MaintenanceShopsService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly placesService: PlacesService,
    private readonly cache: MaintenanceShopsCacheService,
  ) {}

  async findShops(query: MaintenanceShopsQueryDto) {
    const { governorate, city, category } = query;

    const categoryDoc = await this.resolveCategory(category);
    if (!categoryDoc) {
      throw new NotFoundException(`Category '${category}' not found`);
    }

    const searchQuery = `${categoryDoc.name} shops in ${city}, ${governorate}`;
    const cacheKey = searchQuery.toLowerCase();

    const cached = this.cache.get<any[]>(cacheKey);
    if (cached) {
      return { governorate, city, category: categoryDoc.name, searchQuery, results: cached };
    }

    const results = await this.placesService.searchShops(searchQuery);
    this.cache.set(cacheKey, results, CACHE_TTL_MS);

    return { governorate, city, category: categoryDoc.name, searchQuery, results };
  }

  private async resolveCategory(categoryInput: string) {
    const categories = await this.categoriesService.findAll();
    const input = categoryInput.trim().toLowerCase();
    return categories.find(
      (c) => c.key.toLowerCase() === input || c.name.toLowerCase() === input,
    );
  }
}