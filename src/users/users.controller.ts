import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req) {
    return this.usersService.getMe(req.user.userId);
  }

  @Patch('me')
  updateMe(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateMe(req.user.userId, dto);
  }
}
