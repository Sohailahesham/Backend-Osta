import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { MaintenanceShopsController } from './maintenance-shops.controller';
import { MaintenanceShopsService } from './maintenance-shops.service';
import { PlacesService } from './places.service';
import { MaintenanceShopsCacheService } from './maintenance-shops-cache.service';

@Module({
  imports: [CategoriesModule],
  controllers: [MaintenanceShopsController],
  providers: [MaintenanceShopsService, PlacesService, MaintenanceShopsCacheService],
})
export class MaintenanceShopsModule {}