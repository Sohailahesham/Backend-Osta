import { Injectable } from '@nestjs/common';
import { AiOrchestratorService } from '../../ai/ai-orchestrator.service';
import { emergencyPrompt } from '../../ai/prompts/emergency.prompt';
import { emergencyContacts } from './emergency-contacts';

@Injectable()
export class EmergencyService {
  constructor(private readonly ai: AiOrchestratorService) {}

  
async detect(message: string) {
  const result = await this.ai.emergency(emergencyPrompt(message));

  if (result.isEmergency) {
    const contacts: any = { ambulance: emergencyContacts.ambulance };

    if (['gas', 'غاز'].some(k => result.type?.toLowerCase().includes(k))) {
      contacts.gas = emergencyContacts.gas;
    }
    if (['fire', 'حريق', 'كهرباء', 'ماس'].some(k => result.type?.toLowerCase().includes(k))) {
      contacts.fire = emergencyContacts.fire;
    }

    return { ...result, contacts };
  }

  return result;
}
}
