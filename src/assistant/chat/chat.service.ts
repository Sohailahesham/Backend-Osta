import { Injectable, ForbiddenException } from '@nestjs/common';
import { EmergencyService } from '../emergency/emergency.service';
import { ClassificationService } from '../classification/classification.service';
import { MatchingService } from '../matching/matching.service';
import { CatalogService } from '../catalog/catalog.service';
import { GuardrailsService } from '../guardrails/guardrails.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { MemoryService } from '../memory/memory.service';
import { AiOrchestratorService } from '../../ai/ai-orchestrator.service';
import { LoggerService } from 'src/common/logging/logger.service';
import { chatSystemPrompt, buildChatPrompt } from '../../ai/prompts/response.prompt';

const categoryMap: Record<string, string> = {
  electrical: 'ELECTRICITY',
  hvac: 'AC',
  plumbing: 'PLUMBING',
  carpentry: 'CARPENTRY',
  appliance_repair: 'APPLIANCE_REPAIR',
};

@Injectable()
export class ChatService {
  constructor(
    private readonly emergency: EmergencyService,
    private readonly classifier: ClassificationService,
    private readonly matcher: MatchingService,
    private readonly catalog: CatalogService,
    private readonly guardrails: GuardrailsService,
    private readonly analytics: AnalyticsService,
    private readonly memory: MemoryService,
    private readonly ai: AiOrchestratorService,
    private readonly logger: LoggerService,
  ) {}

  async process(
    message: string,
    conversationId?: string,
    clientHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
  ) {
    // 1. Safety check
    const safety = this.guardrails.validate(message);
    if (!safety.allowed) {
      throw new ForbiddenException('Blocked Message');
    }

    // 2. Build history: prefer server memory, fall back to client-sent history
    const convId = conversationId ?? 'default';
    const serverHistory = this.memory.get(convId);
    const history = serverHistory.length > 0 ? serverHistory : (clientHistory ?? []);

    // 3. Save user turn
    this.memory.save(convId, { role: 'user', content: message });

    // 4. Emergency detection (no history needed — fast check)
    const emergency = await this.emergency.detect(message);
    if (emergency.isEmergency) {
      const reply = {
        conversationId: convId,
        emergency: true,
        ...emergency,
      };
      this.memory.save(convId, {
        role: 'assistant',
        content: `طوارئ: ${emergency.type}`,
      });
      return reply;
    }

    // 5. Classify with conversation history for context
    const classification = await this.classifier.classify(message, history);

    // Normalize category key
    const rawCat: string = classification.category ?? '';
    classification.category = categoryMap[rawCat.toLowerCase()] ?? rawCat.toUpperCase();

    // 6. If AI thinks it needs clarification, ask it
    if (classification.needsClarification && classification.clarificationQuestion) {
      this.memory.save(convId, {
        role: 'assistant',
        content: classification.clarificationQuestion,
      });
      return {
        conversationId: convId,
        emergency: false,
        needsClarification: true,
        question: classification.clarificationQuestion,
        category: classification.category,
      };
    }
    // After classification, before matching — add this block:
if (classification.outOfScope) {
  return {
    conversationId: convId,
    emergency: false,
    outOfScope: true,
  };
}

    // 7. Match service + get technicians
    const match = await this.matcher.match(message, classification.category);
    const technicians = await this.catalog.getTechnicians(classification.category);

    // 8. Generate a human-like response with first-aid tips
    const chatPrompt = buildChatPrompt(message, classification.category, match.service?.name);
    const fullHistory = [
      { role: 'user' as const, content: chatSystemPrompt },
      ...history,
    ];
    const aiReply = await this.ai.chat(chatPrompt, fullHistory);

    this.memory.save(convId, { role: 'assistant', content: aiReply });

    this.analytics.track('chat_request', { category: classification.category });
    this.logger.log('chat_processed', classification);

    if (!match.service) {
      return {
        conversationId: convId,
        emergency: false,
        category: classification.category,
        message: aiReply,
        tip: this.getFirstAidTip(classification.category),
        technicians,
      };
    }

    return {
      conversationId: convId,
      emergency: false,
      category: classification.category,
      confidence: match.confidence,
      service: match.service,
      message: aiReply,
      tip: this.getFirstAidTip(classification.category),
      technicians,
    };
  }

  private getFirstAidTip(category: string): string {
    const tips: Record<string, string> = {
      PLUMBING: '💧 نصيحة: أغلق محبس المياه الرئيسي فوراً لتجنب الفيضان حتى يصل الفني.',
      ELECTRICITY: '⚡ نصيحة: أوقف الكهرباء من اللوحة الرئيسية ولا تلمس أي أسلاك مكشوفة.',
      AC: '❄️ نصيحة: نظف فلتر الهواء وتأكد أن الوحدة الخارجية غير مغطاة أو محاطة بعوائق.',
      CARPENTRY: '🔨 نصيحة: لا تحاول إصلاح الباب أو النافذة بالقوة لتجنب كسر الإطار.',
      APPLIANCE_REPAIR: '🔌 نصيحة: افصل الجهاز من الكهرباء فوراً خاصة إذا كانت هناك رائحة أو دخان.',
    };
    return tips[category] ?? '🔧 سيتواصل معك الفني في أقرب وقت ممكن.';
  }
}