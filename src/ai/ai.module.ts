import {
  Module,
} from '@nestjs/common';

import { OpenAiProvider } from './providers/openai.provider';

import { GroqProvider } from './providers/groq.provider';

import { AiOrchestratorService } from './ai-orchestrator.service';

@Module({
  providers: [
    OpenAiProvider,
    GroqProvider,
    AiOrchestratorService,
  ],
  exports: [
    OpenAiProvider,
    GroqProvider,
    AiOrchestratorService,
  ],
})
export class AiModule {}