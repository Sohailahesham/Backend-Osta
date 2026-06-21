import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post, PostSchema } from './schemas/post.schema';
import { Proposal, ProposalSchema } from './schemas/proposal.schema';
import { MainRequest, RequestSchema } from '../request/schemas/request.schema';
import { ChatModule } from 'src/chat/chat.module';
import {
  Technician,
  TechnicianSchema,
} from 'src/technician/schemas/technician.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { User, UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Proposal.name, schema: ProposalSchema },
      { name: MainRequest.name, schema: RequestSchema },
      { name: Technician.name, schema: TechnicianSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ChatModule,
    NotificationModule
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
