import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WalletService } from './wallet.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { RoleDecorator as Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';



@ApiTags('Wallet')
@ApiBearerAuth('JWT')
@Controller('wallet')
@UseGuards(AuthGuard('jwt'))
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // الفني يشوف رصيده
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECHNICIAN)
  getWallet(@Req() req) {
    return this.walletService.getWallet(req.user.userId);
  }

  // الفني يطلب سحب
  @Post('withdraw')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECHNICIAN)
  requestWithdrawal(@Req() req, @Body() dto: RequestWithdrawalDto) {
    return this.walletService.requestWithdrawal(
      req.user.userId,
      dto.amount,
      dto.method,
      dto.accountNumber,
    );
  }

  // الأدمن يشوف كل طلبات السحب
  @Get('withdrawals')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAllWithdrawals() {
    return this.walletService.getAllWithdrawals();
  }

  // الأدمن يوافق
  @Patch('withdrawals/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  approveWithdrawal(@Param('id') id: string) {
    return this.walletService.approveWithdrawal(id);
  }

  // الأدمن يرفض
  @Patch('withdrawals/:id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  rejectWithdrawal(@Param('id') id: string, @Body() dto: RejectWithdrawalDto) {
    return this.walletService.rejectWithdrawal(id, dto.reason);
  }
}