import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { MainRequest, RequestSchema } from 'src/request/schemas/request.schema';
import {
  Technician,
  TechnicianSchema,
} from 'src/technician/schemas/technician.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: MainRequest.name, schema: RequestSchema },
      { name: Technician.name, schema: TechnicianSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
