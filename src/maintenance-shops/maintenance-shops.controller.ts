import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MaintenanceShopsQueryDto } from './dto/maintenance-shops-query.dto';
import { MaintenanceShopsService } from './maintenance-shops.service';

@ApiTags('Maintenance Shops')
@Controller('api/maintenance-shops')
export class MaintenanceShopsController {
  constructor(private readonly maintenanceShopsService: MaintenanceShopsService) {}

  @ApiOperation({ summary: 'Find nearby spare parts & maintenance shops' })
  @ApiResponse({ status: 200, description: 'List of nearby shops with the resolved search query.' })
  @ApiResponse({ status: 400, description: 'Validation failed for governorate, city or category.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @Get()
  async getNearbyShops(@Query() query: MaintenanceShopsQueryDto) {
    return this.maintenanceShopsService.findShops(query);
  }
}