import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketPaginationDto } from './dto/ticket-pagination.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RoleDecorator as Roles } from '../common/decorators/role.decorator';
import { UserRole } from 'src/users/schemas/user.schema';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@ApiTags('Support')
@ApiBearerAuth('JWT')
@Controller('support')
@UseGuards(AuthGuard('jwt'))
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // POST /support — any logged-in user (client or technician) raises a ticket
  @ApiOperation({ summary: 'Create a new support ticket' })
  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(
    FileInterceptor('attachment', {
      storage: diskStorage({
        destination: (req: any, file, cb) => {
          const userId = req.user.userId;
          const uploadPath = `./uploads/support/${userId}`;

          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${unique}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async create(
    @Body() dto: CreateTicketDto,
    @Req() req: AuthRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.supportService.create(req.user.userId, dto, file);
  }

  // GET /support/my — current user's own tickets, paginated
  @ApiOperation({ summary: 'Get my support tickets' })
  @Get('my')
  async findMy(
    @Query() paginationDto: TicketPaginationDto,
    @Req() req: AuthRequest,
  ) {
    return this.supportService.findMy(req.user.userId, paginationDto);
  }

  // GET /support — ADMIN only, all tickets
  @ApiOperation({ summary: '[Admin] Get all support tickets' })
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query() paginationDto: TicketPaginationDto) {
    return this.supportService.findAll(paginationDto);
  }

  // GET /support/:id — owner or admin
  @ApiOperation({ summary: 'Get a single support ticket by id' })
  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.supportService.findById(
      id,
      req.user.userId,
      (req.user as any).role,
    );
  }

  // DELETE /support/:id —  admin
  @ApiOperation({ summary: '[Admin] Delete a support ticket' })
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.supportService.remove(
      id,
      req.user.userId,
      (req.user as any).role,
    );
  }
}
