import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Emergency, EmergencyDocument } from './schemas/emergency.schema';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { UpdateEmergencyDto } from './dto/update-emergency.dto';
import { EmergencyQueryDto } from './dto/emergency-query.dto';

@Injectable()
export class EmergencyService {
  constructor(
    @InjectModel(Emergency.name)
    private emergencyModel: Model<EmergencyDocument>,
  ) {}

  //& GET /emergency — public
  async findAll(query: EmergencyQueryDto) {
    const { page = 1, limit = 10, type } = query;
    const filter = type ? { type } : {};
    const skip = (page - 1) * limit;

    const [total, numbers] = await Promise.all([
      this.emergencyModel.countDocuments(filter),
      this.emergencyModel
      .find(filter)
      .sort({ type: 1, createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      message: 'Emergency numbers retrieved successfully',
      data: numbers,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  //& POST /admin/emergency
  async create(dto: CreateEmergencyDto) {
    const existing = await this.emergencyModel.findOne({ phone: dto.phone });
    if (existing)
      throw new ConflictException('Emergency number already exists');
    const emergency = await this.emergencyModel.create(dto);
    return {
      message: 'Emergency number created successfully',
      data: emergency,
    };
  }

  //& PATCH /admin/emergency/:id
  async update(id: string, dto: UpdateEmergencyDto) {
    const existing = await this.emergencyModel.findOne({ phone: dto.phone });
    if (existing && existing._id.toString() !== id)
      throw new ConflictException('Emergency number already exists');

    const emergency = await this.emergencyModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!emergency) throw new NotFoundException('Emergency number not found');
    return {
      message: 'Emergency number updated successfully',
      data: emergency,
    };
  }

  //& DELETE /admin/emergency/:id
  async remove(id: string) {
    const emergency = await this.emergencyModel.findByIdAndDelete(id).lean();
    if (!emergency) throw new NotFoundException('Emergency number not found');
    return { message: 'Emergency number deleted successfully' };
  }
}
