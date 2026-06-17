import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceShopsController } from './maintenance-shops.controller';
import { MaintenanceShopsService } from './maintenance-shops.service';

describe('MaintenanceShopsController', () => {
  let controller: MaintenanceShopsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceShopsController],
      providers: [MaintenanceShopsService],
    }).compile();

    controller = module.get<MaintenanceShopsController>(MaintenanceShopsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
