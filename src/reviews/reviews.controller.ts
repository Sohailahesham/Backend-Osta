import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RoleDecorator } from 'src/common/decorators/role.decorator';
import { UserRole } from 'src/users/schemas/user.schema';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @RoleDecorator(UserRole.CLIENT)
  create(@Req() req, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.userId, dto);
  }

  @Get('technician/:id')
  findByTechnician(@Param('id', ParseMongoIdPipe) id: string) {
    return this.reviewsService.findByTechnician(id);
  }

  @Get('service/:id')
  findByService(@Param('id', ParseMongoIdPipe) id: string) {
    return this.reviewsService.findByService(id);
  }
}
