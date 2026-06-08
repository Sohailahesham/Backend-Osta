/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { UpdateEmergencyDto } from './dto/update-emergency.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RoleDecorator } from 'src/common/decorators/role.decorator';
import { UserRole } from 'src/users/schemas/user.schema';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { EmergencyQueryDto } from './dto/emergency-query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { EmergencyType } from './schemas/emergency.schema';

//* ── Public ──────────────────────────────────────────────
@ApiTags('Emergency')
@Controller('emergency')
export class EmergencyPublicController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @ApiOperation({
    summary: 'Get emergency numbers (paginated, filter by type)',
  })
  @ApiQuery({ name: 'type', required: false, enum: EmergencyType })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get()
  findAll(@Query() query: EmergencyQueryDto) {
    return this.emergencyService.findAll(query);
  }
}

//* ── Admin ────────────────────────────────────────────────
@ApiTags('Admin')
@ApiBearerAuth('JWT')
@Controller('admin/emergency')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@RoleDecorator(UserRole.ADMIN)
export class EmergencyAdminController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @ApiOperation({ summary: '[Admin] Add emergency number' })
  @Post()
  create(@Body() dto: CreateEmergencyDto) {
    return this.emergencyService.create(dto);
  }

  @ApiOperation({ summary: '[Admin] Update emergency number' })
  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: UpdateEmergencyDto,
  ) {
    return this.emergencyService.update(id, dto);
  }

  @ApiOperation({ summary: '[Admin] Delete emergency number' })
  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.emergencyService.remove(id);
  }
}
