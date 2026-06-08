/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: '[Client] Submit a review for a completed request' })
  @ApiBearerAuth('JWT')
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @RoleDecorator(UserRole.CLIENT)
  create(@Req() req, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Get all reviews for a technician' })
  @Get('technician/:id')
  findByTechnician(@Param('id', ParseMongoIdPipe) id: string) {
    return this.reviewsService.findByTechnician(id);
  }

  @ApiOperation({ summary: 'Get all reviews for a service' })
  @Get('service/:id')
  findByService(@Param('id', ParseMongoIdPipe) id: string) {
    return this.reviewsService.findByService(id);
  }

  @ApiOperation({ summary: '[Client] Edit own review' })
  @ApiBearerAuth('JWT')
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

  @ApiOperation({ summary: '[Client] Delete own review' })
  @ApiBearerAuth('JWT')
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @RoleDecorator(UserRole.CLIENT)
  remove(@Param('id', ParseMongoIdPipe) id: string, @Req() req) {
    return this.reviewsService.remove(id, req.user.userId);
  }
}
