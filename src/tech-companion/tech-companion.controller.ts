import { Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { TechCompanionService } from './tech-companion.service';
import { TechCompanionDto } from './dto/tech-companion.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TechnicianGuard } from 'src/auth/guards/technician.guard';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
@ApiTags('TechCompanion')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TechnicianGuard)
@Controller('tech-companion')
export class TechCompanionController {
  constructor(private readonly techCompanionService: TechCompanionService) {}

  @ApiOperation({ summary: 'Send message to TechCompanion AI' })
  @Post()
  async chat(@Body() body: TechCompanionDto, @Request() req: AuthRequest) {
    return this.techCompanionService.process(
      body.message,
      req.user.userId,
      body.conversationId,
    );
  }

  @ApiOperation({ summary: 'Get category-specific quick chips for TechCompanion' })
  @Get('chips')
  async chips(@Request() req: AuthRequest) {
    return this.techCompanionService.getChips(req.user.userId);
  }
}