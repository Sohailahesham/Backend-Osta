
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from '../ai/ai.module';
import { ServicesModule } from '../services/services.module';
import { CategoriesModule } from '../categories/categories.module';
import { User, UserSchema } from '../users/schemas/user.schema';import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { ClassificationService } from './classification/classification.service';
import { EmergencyService } from './emergency/emergency.service';
import { MatchingService } from './matching/matching.service';
import { CatalogService } from './catalog/catalog.service';
import { GuardrailsService } from './guardrails/guardrails.service';
import { AnalyticsService } from './analytics/analytics.service';
import { MemoryService } from './memory/memory.service';
import { LoggerService } from 'src/common/logging/logger.service';

@Module({
  imports: [
    AiModule,        // GroqProvider, OpenAiProvider, AiOrchestratorService
    ServicesModule,  // exports ServicesService → used by CatalogService
    CategoriesModule, // exports CategoriesService → used by CatalogService
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // for technician queries
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ClassificationService,
    EmergencyService,
    MatchingService,
    CatalogService,
    GuardrailsService,
    AnalyticsService,
    MemoryService,
    LoggerService,
  ],
})
export class AssistantModule {}
