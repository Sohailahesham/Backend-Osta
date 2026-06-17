import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceShopsService } from './maintenance-shops.service';

describe('MaintenanceShopsService', () => {
  let service: MaintenanceShopsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaintenanceShopsService],
    }).compile();

    service = module.get<MaintenanceShopsService>(MaintenanceShopsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
