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

//* ── Public ──────────────────────────────────────────────
@Controller('emergency')
export class EmergencyPublicController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Get()
  findAll(@Query() query: EmergencyQueryDto) {
    return this.emergencyService.findAll(query);
  }
}

//* ── Admin ────────────────────────────────────────────────
@Controller('admin/emergency')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@RoleDecorator(UserRole.ADMIN)
export class EmergencyAdminController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post()
  create(@Body() dto: CreateEmergencyDto) {
    return this.emergencyService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: UpdateEmergencyDto,
  ) {
    return this.emergencyService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.emergencyService.remove(id);
  }
}
