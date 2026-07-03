import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as fs from 'fs';
import {
  SupportTicket,
  SupportTicketDocument,
} from './schemas/support-ticket.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketPaginationDto } from './dto/ticket-pagination.dto';
import { TicketStatus } from './enums/ticket-status.enum';
import { UserRole } from 'src/users/schemas/user.schema';

// Base offset so generated numbers read like "OST-10248", matching the design
const TICKET_NUMBER_BASE = 10247;

@Injectable()
export class SupportService {
  constructor(
    @InjectModel(SupportTicket.name)
    private readonly ticketModel: Model<SupportTicketDocument>,
  ) {}

  // ─── helpers ──────────────────────────────────────────────────────────────

  private async generateTicketNumber(): Promise<string> {
    const count = await this.ticketModel.countDocuments();
    return `OST-${TICKET_NUMBER_BASE + count + 1}`;
  }

  private assertOwnerOrAdmin(
    ticket: SupportTicketDocument,
    userId: string,
    role?: UserRole,
  ) {
    const isOwner = ticket.userId.toString() === userId;
    const isAdmin = role === UserRole.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('غير مصرح لك بالوصول إلى هذه التذكرة');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  // create a ticket — any logged in user (client or technician)
  async create(
    userId: string,
    dto: CreateTicketDto,
    file?: Express.Multer.File,
  ): Promise<SupportTicketDocument> {
    const ticketNumber = await this.generateTicketNumber();

    return this.ticketModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      ticketNumber,
      status: TicketStatus.OPEN,
      attachmentUrl: file ? `/uploads/support/${userId}/${file.filename}` : null,
      attachmentName: file ? file.originalname : null,
      attachmentSize: file ? file.size : null,
    });
  }

  // GET /support/my — the logged-in user's own tickets, paginated
  async findMy(userId: string, dto: TicketPaginationDto) {
    const { page = 1, limit = 10, status } = dto;
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      this.ticketModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.ticketModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // GET /support — ADMIN only, all tickets paginated
  async findAll(dto: TicketPaginationDto) {
    const { page = 1, limit = 10, status } = dto;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      this.ticketModel
        .find(filter)
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.ticketModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // GET /support/:id — owner or admin
  async findById(id: string, userId: string, role?: UserRole) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) throw new NotFoundException('التذكرة غير موجودة');

    this.assertOwnerOrAdmin(ticket, userId, role);
    return ticket;
  }

  // DELETE /support/:id — owner or admin
  async remove(id: string, userId: string, role?: UserRole) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) throw new NotFoundException('التذكرة غير موجودة');

    this.assertOwnerOrAdmin(ticket, userId, role);

    // best-effort cleanup of the attachment file on disk
    if (ticket.attachmentUrl) {
      const filePath = `.${ticket.attachmentUrl}`;
      fs.unlink(filePath, () => {
        /* ignore errors — file may already be gone */
      });
    }

    await this.ticketModel.deleteOne({ _id: id });
    return { deleted: true };
  }
}
