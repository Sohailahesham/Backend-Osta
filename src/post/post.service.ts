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
import {
  Technician,
  TechnicianDocument,
} from 'src/technician/schemas/technician.schema';

// ── NOTIFICATION IMPORTS ──────────────────────────────────────────────────────
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/enums/notification-type.enum';
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
    @InjectModel(MainRequest.name) private requestModel: Model<RequestDocument>,
    @InjectModel(Technician.name)
    private technicianModel: Model<TechnicianDocument>,
    private readonly chatGateway: ChatGateway,
    // ── NOTIFICATION SERVICE ─────────────────────────────────────────────────
    private readonly notificationService: NotificationService,
    // ─────────────────────────────────────────────────────────────────────────
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

  async findAssignedCustomRequests(technicianId: string) {
    const proposals = await this.proposalModel
      .find({
        technicianId: new Types.ObjectId(technicianId),
        status: ProposalStatus.ACCEPTED,
      })
      .populate({
        path: 'postId',
        populate: { path: 'userId', select: 'fullName phone governorate city' },
      })
      .lean()
      .exec();

    if (proposals.length === 0) {
      return { data: [] };
    }

    const postIds = proposals
      .map((proposal) => proposal.postId?._id)
      .filter((value): value is Types.ObjectId => Boolean(value));

    const requests = await this.requestModel
      .find({
        postId: { $in: postIds },
        assignedTechnician: new Types.ObjectId(technicianId),
      })
      .select(
        'postId status depositAmount depositStatus preferredDate preferredTime createdAt updatedAt notes completionNote totalPrice address userId',
      )
      .lean()
      .exec();

    const requestByPostId = new Map(
      requests.map((request) => [request.postId?.toString(), request]),
    );

    const data = proposals
      .map((proposal) => {
        const post = proposal.postId as any;
        if (!post?._id) return null;

        const matchedRequest = requestByPostId.get(post._id.toString());

        return {
          _id: matchedRequest?._id ?? post.requestId ?? post._id,
          status: matchedRequest?.status ?? RequestStatus.ACCEPTED,
          depositAmount: matchedRequest?.depositAmount,
          depositStatus: matchedRequest?.depositStatus,
          preferredDate: matchedRequest?.preferredDate ?? post.preferredDate,
          preferredTime: matchedRequest?.preferredTime ?? post.preferredTime,
          createdAt: matchedRequest?.createdAt ?? proposal.createdAt,
          updatedAt: matchedRequest?.updatedAt ?? proposal.updatedAt,
          notes: matchedRequest?.notes ?? proposal.description ?? post.description,
          completionNote: matchedRequest?.completionNote ?? null,
          totalPrice: matchedRequest?.totalPrice ?? proposal.price,
          userId: post.userId ?? null,
          serviceId: null,
          postId: {
            _id: post._id,
            title: post.title,
            budget: post.budget,
            acceptedProposal: {
              _id: proposal._id,
              estimatedTime: proposal.estimatedTime,
              price: proposal.price,
            },
          },
          address: matchedRequest?.address ?? post.address,
        };
      })
      .filter(Boolean);

    return { data };
  }

  async findPendingCustomRequestsForTechnician(technicianId: string) {
    const proposals = await this.proposalModel
      .find({
        technicianId: new Types.ObjectId(technicianId),
        status: { $in: [ProposalStatus.PENDING, ProposalStatus.ACCEPTED] },
      })
      .populate({
        path: 'postId',
        populate: { path: 'userId', select: 'fullName phone governorate city' },
      })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    if (proposals.length === 0) {
      return { data: [] };
    }

    const postIds = proposals
      .map((proposal) => proposal.postId?._id)
      .filter((value): value is Types.ObjectId => Boolean(value));

    const requests = await this.requestModel
      .find({
        postId: { $in: postIds },
        assignedTechnician: new Types.ObjectId(technicianId),
      })
      .select(
        'postId status depositAmount depositStatus preferredDate preferredTime createdAt updatedAt notes completionNote totalPrice address userId',
      )
      .lean()
      .exec();

    const requestByPostId = new Map(
      requests.map((request) => [request.postId?.toString(), request]),
    );

    const data = proposals
      .map((proposal) => {
        const post = proposal.postId as any;
        if (!post?._id) return null;

        const matchedRequest = requestByPostId.get(post._id.toString());
        const isWaitingClient =
          proposal.status === ProposalStatus.PENDING && !matchedRequest;

        return {
          _id:
            matchedRequest?._id?.toString() ??
            `proposal:${proposal._id.toString()}`,
          requestId: matchedRequest?._id?.toString() ?? null,
          chatRequestId: matchedRequest?._id?.toString() ?? null,
          proposalId: proposal._id.toString(),
          pendingSource: isWaitingClient ? 'proposal' : 'request',
          status: isWaitingClient
            ? RequestStatus.PENDING
            : matchedRequest?.status ?? RequestStatus.ACCEPTED,
          depositAmount: matchedRequest?.depositAmount,
          depositStatus: matchedRequest?.depositStatus,
          preferredDate: matchedRequest?.preferredDate ?? post.preferredDate,
          preferredTime: matchedRequest?.preferredTime ?? post.preferredTime,
          createdAt: matchedRequest?.createdAt ?? proposal.createdAt,
          updatedAt: matchedRequest?.updatedAt ?? proposal.updatedAt,
          notes:
            matchedRequest?.notes ?? proposal.description ?? post.description,
          completionNote: matchedRequest?.completionNote ?? null,
          totalPrice: matchedRequest?.totalPrice ?? proposal.price,
          userId: post.userId ?? null,
          serviceId: null,
          postId: {
            _id: post._id,
            title: post.title,
            budget: post.budget,
            acceptedProposal: {
              _id: proposal._id,
              estimatedTime: proposal.estimatedTime,
              price: proposal.price,
            },
          },
          address: matchedRequest?.address ?? post.address,
        };
      })
      .filter(Boolean);

    return { data };
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
  // NOTIFICATION → client receives alert that a new proposal arrived on their post
  async submitProposal(
    postId: string,
    technicianId: string,
    dto: CreateProposalDto,
  ): Promise<ProposalDocument> {
    // NOTE: do NOT .populate('userId', ...) here — we need post.userId to stay
    // a raw ObjectId so it can be safely converted to a string for the
    // notification recipientId. Populating it turns it into a Document and
    // .toString() on that does not return a valid ObjectId hex string.
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const technician = await this.technicianModel.findOne({
      userId: new Types.ObjectId(technicianId),
    });
    if (!technician) throw new NotFoundException('Technician not found');

    if (
      technician.specialization.categoryId.toString() !==
      post.categoryId.toString()
    )
      throw new BadRequestException(
        'Technician does not specialize in this category',
      );

    if (post.status !== PostStatus.OPEN)
      throw new BadRequestException('Post is no longer open');

    const existing = await this.proposalModel.findOne({
      postId: new Types.ObjectId(postId),
      technicianId: new Types.ObjectId(technicianId),
    });

    if (existing)
      throw new BadRequestException('You already submitted a proposal');

    const proposal = await this.proposalModel.create({
      ...dto,
      postId: new Types.ObjectId(postId),
      technicianId: new Types.ObjectId(technicianId),
      status: ProposalStatus.PENDING,
    });

    // ── NOTIFICATION: tell the client a new proposal has arrived ─────────────
    try {
      await this.notificationService.send({
        recipientId: post.userId.toString(),
        type: NotificationType.NEW_PROPOSAL,
        title: 'عرض جديد على طلبك 📋',
        body: `قدّم أحد الفنيين عرضاً جديداً على طلبك. السعر المقترح: ${dto.price} ج.م.`,
        requestId: postId,          // reusing requestId field to carry postId for frontend routing
        metadata: {
          postId,
          proposalId: (proposal._id as Types.ObjectId).toString(),
          technicianId,
          price: dto.price,
          estimatedTime: dto.estimatedTime,
        },
      });
    } catch (err) {
      // Never let a notification failure break proposal creation itself
      console.error('[submitProposal] Failed to send NEW_PROPOSAL notification:', err);
    }
    // ─────────────────────────────────────────────────────────────────────────

    return proposal;
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
  // NOTIFICATION → accepted technician gets congratulated
  // NOTIFICATION → all rejected technicians get notified too
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

    const rejectedProposals = await this.proposalModel.find({
      postId: new Types.ObjectId(postId),
      _id: { $ne: proposalId },
    });

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

    this.chatGateway.closeCustomRooms(
      postId,
      proposal.technicianId.toString(),
      rejectedProposals.map((p) => p.technicianId.toString()),
    );

    await this.postModel.findByIdAndUpdate(postId, {
      status: PostStatus.ACCEPTED,
      acceptedProposal: new Types.ObjectId(proposalId),
      requestId: request._id,
    });

    // ── NOTIFICATION: tell the accepted technician their proposal won ─────────
    try {
      await this.notificationService.send({
        recipientId: proposal.technicianId.toString(),
        type: NotificationType.PROPOSAL_ACCEPTED,
        title: 'تم قبول عرضك 🎉',
        body: `قبل العميل عرضك. يرجى انتظار دفع العربون للمتابعة.`,
        requestId: request._id.toString(),
        metadata: {
          postId,
          proposalId,
          requestId: request._id.toString(),
          price: proposal.price,
        },
      });
    } catch (err) {
      console.error('[acceptProposal] Failed to send PROPOSAL_ACCEPTED notification:', err);
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ── NOTIFICATION: tell all rejected technicians their proposals were declined
    try {
      await Promise.all(
        rejectedProposals.map((rejectedProposal) =>
          this.notificationService.send({
            recipientId: rejectedProposal.technicianId.toString(),
            type: NotificationType.PROPOSAL_REJECTED,
            title: 'لم يتم قبول عرضك ❌',
            body: 'اختار العميل عرضاً آخر. شكراً لمشاركتك.',
            requestId: postId,
            metadata: {
              postId,
              proposalId: (rejectedProposal._id as Types.ObjectId).toString(),
            },
          }),
        ),
      );
    } catch (err) {
      console.error('[acceptProposal] Failed to send PROPOSAL_REJECTED notification(s):', err);
    }
    // ─────────────────────────────────────────────────────────────────────────

    return {
      data: request,
      message: 'accepted so the next step is paying the deposit ',
    };
  }

  // ─── Cancel Post (CLIENT) ─────────────────────────────────────────────────
  // NOTIFICATION → all pending technicians notified that the post was cancelled
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

    // Fetch all pending proposals BEFORE rejecting them, so we know who to notify
    const pendingProposals = await this.proposalModel.find({
      postId: new Types.ObjectId(postId),
      status: ProposalStatus.PENDING,
    });

    // Debug: if this logs 0, it means either no one proposed yet, or the
    // proposals were already moved out of PENDING status before cancellation.
    console.log(
      `[cancelPost] postId=${postId} → found ${pendingProposals.length} pending proposal(s) to notify`,
    );

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

    // ── NOTIFICATION: tell all technicians who proposed that the post is cancelled
    try {
      await Promise.all(
        pendingProposals.map((proposal) =>
          this.notificationService.send({
            recipientId: proposal.technicianId.toString(),
            type: NotificationType.POST_CANCELLED,
            title: 'تم إلغاء الطلب ❌',
            body: 'قام العميل بإلغاء الطلب الذي قدّمت عليه عرضاً.',
            requestId: postId,
            metadata: {
              postId,
              proposalId: (proposal._id as Types.ObjectId).toString(),
            },
          }),
        ),
      );
    } catch (err) {
      console.error('[cancelPost] Failed to send POST_CANCELLED notification(s):', err);
    }
    // ─────────────────────────────────────────────────────────────────────────

    return { message: 'Post cancelled successfully' };
  }
}
