import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvoiceService } from './invoice.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { RoleDecorator as Roles } from '../common/decorators/role.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Invoices')
@ApiBearerAuth('JWT')
@Controller('invoices')
@UseGuards(AuthGuard('jwt'))
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  // GET /invoices/my
  @ApiOperation({ summary: '[Client] Get my invoices' })
  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CLIENT)
  getMyInvoices(@Req() req) {
    return this.invoiceService.findByClient(req.user.userId);
  }

  // GET /invoices
  @ApiOperation({ summary: '[Admin] Get all invoices' })
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.invoiceService.findAll();
  }

  // GET /invoices/:id
  @ApiOperation({ summary: 'Get invoice by ID' })
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findById(@Param('id') id: string, @Req() req) {
    return this.invoiceService.findById(id, req.user.userId, req.user.role);
  }
}
