import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TechnicianService } from './technician.service';
import { TechnicianController } from './technician.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { ServiceEntity, ServiceSchema } from 'src/services/schemas/service.schema';
import { Category, CategorySchema } from 'src/categories/schemas/category.schema';
import { Technician, TechnicianSchema } from './schemas/technician.schema';

@Module({
  imports: [
     MongooseModule.forFeature([
      { name: Technician.name, schema: TechnicianSchema },
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: ServiceEntity.name, schema: ServiceSchema },
    ]),
    AuthModule,
  ],
  controllers: [TechnicianController],
  providers: [TechnicianService],
})
export class TechnicianModule {}