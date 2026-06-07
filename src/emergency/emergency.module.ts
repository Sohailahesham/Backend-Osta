import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Emergency, EmergencySchema } from './schemas/emergency.schema';
import { EmergencyService } from './emergency.service';
import {
  EmergencyPublicController,
  EmergencyAdminController,
} from './emergency.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Emergency.name, schema: EmergencySchema },
    ]),
  ],
  controllers: [EmergencyPublicController, EmergencyAdminController],
  providers: [EmergencyService],
})
export class EmergencyModule {}
