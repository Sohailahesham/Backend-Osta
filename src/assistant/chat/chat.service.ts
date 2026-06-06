import { Injectable, ForbiddenException } from '@nestjs/common';
import { EmergencyService } from '../emergency/emergency.service';
import { ClassificationService } from '../classification/classification.service';
import { MatchingService } from '../matching/matching.service';
import { CatalogService } from '../catalog/catalog.service';
import { GuardrailsService } from '../guardrails/guardrails.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { LoggerService } from 'src/common/logging/logger.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly emergency: EmergencyService,
    private readonly classifier: ClassificationService,
    private readonly matcher: MatchingService,
    private readonly catalog: CatalogService,
    private readonly guardrails: GuardrailsService,
    private readonly analytics: AnalyticsService,
    private readonly logger: LoggerService,
  ) {}

  async process(message: string) {
    const safety = this.guardrails.validate(message);

    if (!safety.allowed) {
      throw new ForbiddenException('Blocked Message');
    }

    const emergency = await this.emergency.detect(message);

    if (emergency.isEmergency) {
      return emergency;
    }

    
    const classification = await this.classifier.classify(message);

    const match = await this.matcher.match(message, classification.category);

    const categoryMap = {
  electrical: 'ELECTRICITY',
  hvac: 'AC',
  plumbing: 'PLUMBING',
  carpentry: 'CARPENTRY',
  appliance_repair: 'APPLIANCE_REPAIR',
};

classification.category =
  categoryMap[classification.category?.toLowerCase()] ||
  classification.category;
  
    const technicians = await this.catalog.getTechnicians(
      classification.category,
    );

    this.analytics.track('chat_request', {
      category: classification.category,
    });

    this.logger.log('chat_processed', classification);

    if (!match.service) {
      return {
        emergency: false,
        category: classification.category,
        message: 'لم يتم العثور على خدمة مناسبة. يمكنك تصفح الفنيين مباشرة.',
        technicians,
      };
    }

    return {
      emergency: false,
      category: classification.category,
      confidence: match.confidence,
      service: match.service,
      technicians,
    };
  }
}
