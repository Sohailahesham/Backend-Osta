import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument, PostStatus } from './schemas/post.schema';
import {
  Proposal,
  ProposalDocument,
  ProposalStatus,
} from './schemas/proposal.schema';
import {
  MainRequest,
  RequestDocument,
} from '../request/schemas/request.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { RequestStatus } from '../request/enums/request-status.enum';
import { ChatGateway } from 'src/chat/chat.gateway';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
    @InjectModel(MainRequest.name) private requestModel: Model<RequestDocument>,
    private readonly chatGateway: ChatGateway,
  ) {}

  // ─── Create Post (CLIENT) ─────────────────────────────────────────────────
  async createPost(
    userId: string,
    dto: CreatePostDto,
    imagePath?: string,
  ): Promise<PostDocument> {
    return this.postModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      categoryId: new Types.ObjectId(dto.categoryId),
      preferredDate: new Date(dto.preferredDate),
      status: PostStatus.OPEN,
      image: imagePath ?? null,
    });
  }

  // ─── Get All Open Posts (TECHNICIAN) ──────────────────────────────────────
  async findAllOpen(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.postModel
        .find({ status: PostStatus.OPEN })
        .populate('userId', 'fullName')
        .populate('categoryId', 'name')
        .sort({ isEmergency: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.postModel.countDocuments({ status: PostStatus.OPEN }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Get Post By Id ───────────────────────────────────────────────────────
  async findById(postId: string): Promise<PostDocument> {
    const post = await this.postModel
      .findById(postId)
      .populate('userId', 'fullName phone')
      .populate('categoryId', 'name')
      .populate('acceptedProposal')
      .exec();

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // ─── Get My Posts (CLIENT) ────────────────────────────────────────────────
  async findMyPosts(userId: string, page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.postModel
        .find({ userId: new Types.ObjectId(userId) })
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.postModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Submit Proposal (TECHNICIAN) ─────────────────────────────────────────
  async submitProposal(
    postId: string,
    technicianId: string,
    dto: CreateProposalDto,
  ): Promise<ProposalDocument> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    if (post.status !== PostStatus.OPEN)
      throw new BadRequestException('Post is no longer open');

    const existing = await this.proposalModel.findOne({
      postId: new Types.ObjectId(postId),
      technicianId: new Types.ObjectId(technicianId),
    });

    if (existing)
      throw new BadRequestException('You already submitted a proposal');

    return this.proposalModel.create({
      ...dto,
      postId: new Types.ObjectId(postId),
      technicianId: new Types.ObjectId(technicianId),
      status: ProposalStatus.PENDING,
    });
  }

  // ─── Get Proposals (CLIENT) ───────────────────────────────────────────────
  async getProposals(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    if (post.userId.toString() !== userId)
      throw new ForbiddenException('Not authorized');

    return this.proposalModel
      .find({ postId: new Types.ObjectId(postId) })
      .populate(
        'technicianId',
        'fullName averageRating totalReviews yearsOfExperience specialization verificationStatus',
      )
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // ─── Accept Proposal (CLIENT) ─────────────────────────────────────────────
  async acceptProposal(postId: string, proposalId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    if (post.userId.toString() !== userId)
      throw new ForbiddenException('Not authorized');

    if (post.status !== PostStatus.OPEN)
      throw new BadRequestException('Post is no longer open');

    const proposal = await this.proposalModel.findById(proposalId);
    if (!proposal) throw new NotFoundException('Proposal not found');

    if (proposal.postId.toString() !== postId)
      throw new BadRequestException('Proposal does not belong to this post');

    await this.proposalModel.updateMany(
      { postId: new Types.ObjectId(postId), _id: { $ne: proposalId } },
      { status: ProposalStatus.REJECTED },
    );

    await this.proposalModel.findByIdAndUpdate(proposalId, {
      status: ProposalStatus.ACCEPTED,
    });

    const request = await this.requestModel.create({
      userId: post.userId,
      categoryId: post.categoryId,
      address: post.address,
      preferredDate: post.preferredDate,
      preferredTime: post.preferredTime,
      notes: post.description,
      assignedTechnician: proposal.technicianId,
      totalPrice: proposal.price,
      status: RequestStatus.ACCEPTED,
      postId: (post as any)._id,
    });

    await this.postModel.findByIdAndUpdate(postId, {
      status: PostStatus.ACCEPTED,
      acceptedProposal: new Types.ObjectId(proposalId),
      requestId: request._id,
    });

    return {
      data: request,
      message: 'accepted so the next step is paying the deposit ',
    };
  }

  // ─── Cancel Post (CLIENT) ─────────────────────────────────────────────────
  async cancelPost(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    if (post.userId.toString() !== userId)
      throw new ForbiddenException('Not authorized');

    if (post.requestId) {
      const request = await this.requestModel.findById(post.requestId);
      if (
        request &&
        (request.status === RequestStatus.ON_THE_WAY ||
          request.status === RequestStatus.STARTED ||
          request.status === RequestStatus.COMPLETED)
      ) {
        throw new BadRequestException('Cannot cancel post at this stage');
      }
    }

    await this.proposalModel.updateMany(
      { postId: new Types.ObjectId(postId) },
      { status: ProposalStatus.REJECTED },
    );

    await this.postModel.findByIdAndUpdate(postId, {
      status: PostStatus.CANCELLED,
    });

    if (post.requestId) {
      this.chatGateway.closeRoom(post.requestId.toString());
    }

    return { message: 'Post cancelled successfully' };
  }
}
