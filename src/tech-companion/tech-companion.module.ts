import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TechCompanionController } from './tech-companion.controller';
import { TechCompanionService } from './tech-companion.service';
import { AiModule } from 'src/ai/ai.module';
import {
  Technician,
  TechnicianSchema,
} from 'src/technician/schemas/technician.schema';
import {
  MainRequest,
  RequestSchema,
} from 'src/request/schemas/request.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [
    AiModule,
    MongooseModule.forFeature([
      { name: Technician.name, schema: TechnicianSchema },
      { name: MainRequest.name, schema: RequestSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TechCompanionController],
  providers: [TechCompanionService],
})
export class TechCompanionModule {}