import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import {
  Technician,
  TechnicianSchema,
} from '../technician/schemas/technician.schema';
import { MainRequest, RequestSchema } from 'src/request/schemas/request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      { name: Technician.name, schema: TechnicianSchema },
      { name: MainRequest.name, schema: RequestSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
