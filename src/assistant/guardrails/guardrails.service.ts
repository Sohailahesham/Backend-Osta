import { Injectable } from '@nestjs/common';

@Injectable()
export class GuardrailsService {
  private blockedTerms = ['اصنع قنبلة', 'اختراق', 'hack', 'bomb'];

  validate(message: string) {
    const lower = message.toLowerCase();

    const blocked = this.blockedTerms.some((term) =>
      lower.includes(term.toLowerCase()),
    );

    return { allowed: !blocked };
  }
}
