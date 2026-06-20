import { Injectable } from '@nestjs/common';
import { AiOrchestratorService, ConversationHistory } from '../../ai/ai-orchestrator.service';
import { classificationPrompt } from '../../ai/prompts/classify.prompt';

@Injectable()
export class ClassificationService {
  constructor(private readonly ai: AiOrchestratorService) {}

  async classify(message: string, history: ConversationHistory = []) {
    return this.ai.classify(classificationPrompt(message), history);
  }
}