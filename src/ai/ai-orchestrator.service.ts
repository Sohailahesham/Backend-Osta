import { Injectable } from '@nestjs/common';
import { GroqProvider } from './providers/groq.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { JsonResponseParser } from 'src/common/parsers/json-response.parser';
import { AiResponseValidator } from 'src/common/validators/ai-response.validator';
import { AiException } from 'src/common/exceptions/ai.exception';

@Injectable()
export class AiOrchestratorService {
  constructor(
    private readonly groq: GroqProvider,
    private readonly openai: OpenAiProvider,
  ) {}

  async classify(prompt: string) {
    try {
      const response = await this.groq.ask(prompt);
      const parsed = JsonResponseParser.parse(response);

      if (!AiResponseValidator.classification(parsed)) {
        throw new Error('Invalid classification shape');
      }

      return parsed;
    } catch (err) {
      console.error('[AiOrchestrator] classify Groq failed, trying OpenAI fallback:', err);
      return this.classifyFallback(prompt);
    }
  }

  async classifyFallback(prompt: string) {
    try {
      const response = await this.openai.ask(prompt);
      return JsonResponseParser.parse(response);
    } catch (err) {
      console.error('[AiOrchestrator] classifyFallback OpenAI failed:', err);
      throw new AiException('Classification Failed');
    }
  }

  async emergency(prompt: string) {
    // Try Groq first (faster), fall back to OpenAI
    try {
      const response = await this.groq.ask(prompt);
      const parsed = JsonResponseParser.parse(response);

      if (!AiResponseValidator.emergency(parsed)) {
        throw new Error('Invalid emergency shape');
      }

      return parsed;
    } catch (err) {
      console.error('[AiOrchestrator] emergency Groq failed, trying OpenAI fallback:', err);
    }

    try {
      const response = await this.openai.ask(prompt);
      const parsed = JsonResponseParser.parse(response);

      if (!AiResponseValidator.emergency(parsed)) {
        throw new Error('Invalid emergency shape from OpenAI');
      }

      return parsed;
    } catch (err) {
      console.error('[AiOrchestrator] emergency OpenAI also failed:', err);
      throw new AiException('Emergency Detection Failed');
    }
  }

  async generateExplanation(prompt: string) {
    try {
      return await this.openai.ask(prompt);
    } catch (err) {
      console.error('[AiOrchestrator] generateExplanation failed:', err);
      return await this.groq.ask(prompt);
    }
  }
}
