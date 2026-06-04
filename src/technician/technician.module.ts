import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TechnicianService } from './technician.service';
import { TechnicianController } from './technician.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { ServiceEntity, ServiceSchema } from 'src/services/schemas/service.schema';
import { Category, CategorySchema } from 'src/categories/schemas/category.schema';

@Module({
  imports: [
     MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ServiceEntity.name, schema: ServiceSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    AuthModule,
  ],
  controllers: [TechnicianController],
  providers: [TechnicianService],
})
export class TechnicianModule {}