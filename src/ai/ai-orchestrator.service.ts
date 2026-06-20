import { Injectable } from '@nestjs/common';
import { GroqProvider } from './providers/groq.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { JsonResponseParser } from 'src/common/parsers/json-response.parser';
import { AiResponseValidator } from 'src/common/validators/ai-response.validator';
import { AiException } from 'src/common/exceptions/ai.exception';

export type ConversationHistory = Array<{ role: 'user' | 'assistant'; content: string }>;

@Injectable()
export class AiOrchestratorService {
  constructor(
    private readonly groq: GroqProvider,
    private readonly groqFallback: OpenAiProvider, // second Groq model
  ) {}

  async classify(prompt: string, history: ConversationHistory = []) {
    try {
      const response = await this.groq.ask(prompt, history);
      const parsed = JsonResponseParser.parse(response);

      if (!AiResponseValidator.classification(parsed)) {
        throw new Error('Invalid classification shape');
      }

      return parsed;
    } catch (err) {
      console.error('[AiOrchestrator] classify primary failed, trying fallback:', err);
      return this.classifyFallback(prompt, history);
    }
  }

  async classifyFallback(prompt: string, history: ConversationHistory = []) {
    try {
      const response = await this.groqFallback.ask(prompt, history);
      return JsonResponseParser.parse(response);
    } catch (err) {
      console.error('[AiOrchestrator] classifyFallback also failed:', err);
      throw new AiException('Classification Failed');
    }
  }

  async emergency(prompt: string, history: ConversationHistory = []) {
    try {
      const response = await this.groq.ask(prompt, history);
      const parsed = JsonResponseParser.parse(response);

      if (!AiResponseValidator.emergency(parsed)) {
        throw new Error('Invalid emergency shape');
      }

      return parsed;
    } catch (err) {
      console.error('[AiOrchestrator] emergency primary failed, trying fallback:', err);
    }

    try {
      const response = await this.groqFallback.ask(prompt, history);
      const parsed = JsonResponseParser.parse(response);

      if (!AiResponseValidator.emergency(parsed)) {
        throw new Error('Invalid emergency shape from fallback');
      }

      return parsed;
    } catch (err) {
      console.error('[AiOrchestrator] emergency fallback also failed:', err);
      throw new AiException('Emergency Detection Failed');
    }
  }

  async chat(prompt: string, history: ConversationHistory = []) {
    try {
      return await this.groq.ask(prompt, history);
    } catch (err) {
      console.error('[AiOrchestrator] chat primary failed, trying fallback:', err);
      return await this.groqFallback.ask(prompt, history);
    }
  }
}