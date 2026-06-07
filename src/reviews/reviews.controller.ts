import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { UpdateReviewDto } from './dto/update-review.dto';

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

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @RoleDecorator(UserRole.CLIENT)
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Req() req,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @RoleDecorator(UserRole.CLIENT)
  remove(@Param('id', ParseMongoIdPipe) id: string, @Req() req) {
    return this.reviewsService.remove(id, req.user.userId);
  }
}
