/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name)
    private reviewModel: Model<ReviewDocument>,
    @InjectModel('Request')
    private requestModel: Model<any>,
    @InjectModel('User')
    private userModel: Model<any>,
  ) {}

  //& POST /reviews
  async create(userId: string, dto: CreateReviewDto) {
    const request = await this.requestModel.findOne({
      _id: dto.requestId,
      userId,
    });
    if (!request) throw new NotFoundException('Request not found');

    if (request.status !== 'completed') {
      throw new BadRequestException('You can only review a completed request');
    }

    const existing = await this.reviewModel.findOne({
      requestId: dto.requestId,
    });
    if (existing) {
      throw new ConflictException('You already reviewed this request');
    }

    const review = await this.reviewModel.create({
      userId,
      technicianId: request.technicianId,
      serviceId: request.serviceId,
      requestId: dto.requestId,
      rating: dto.rating,
      comment: dto.comment,
    });

    await this.updateTechnicianRating(request.technicianId.toString());

    return { message: 'Review submitted successfully', data: review };
  }

  //& GET /reviews/technician/:id
  async findByTechnician(technicianId: string) {
    const reviews = await this.reviewModel
    .find({ technicianId: new Types.ObjectId(technicianId) })
    .populate('userId', 'fullName')
    .populate('serviceId', 'title')
    .sort({ createdAt: -1 })
    .lean();

    return {
      message: 'Technician reviews retrieved successfully',
      data: reviews,
    };
  }

  //& GET /reviews/service/:id
  async findByService(serviceId: string) {
    const reviews = await this.reviewModel
    .find({ serviceId: new Types.ObjectId(serviceId) })
    .populate('userId', 'fullName')
    .populate('technicianId', 'fullName')
    .sort({ createdAt: -1 })
    .lean();

    return {
      message: 'Service reviews retrieved successfully',
      data: reviews,
    };
  }

  private async updateTechnicianRating(technicianId: string) {
    const result = await this.reviewModel.aggregate([
      { $match: { technicianId: new Types.ObjectId(technicianId) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (result.length > 0) {
      await this.userModel.findByIdAndUpdate(technicianId, {
        averageRating: Math.round(result[0].avg * 10) / 10,
        totalReviews: result[0].count,
      });
    }
  }
}
