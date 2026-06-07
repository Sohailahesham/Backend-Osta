import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './schemas/review.schema';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { MainRequest, RequestSchema } from 'src/request/schemas/request.schema';
import {
  Technician,
  TechnicianSchema,
} from 'src/technician/schemas/technician.schema';
import {
  ServiceEntity,
  ServiceSchema,
} from 'src/services/schemas/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: MainRequest.name, schema: RequestSchema },
      { name: Technician.name, schema: TechnicianSchema },
      { name: ServiceEntity.name, schema: ServiceSchema },
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
