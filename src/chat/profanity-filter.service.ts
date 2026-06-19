import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ARABIC_PROFANITY_WORDS,
  ENGLISH_PROFANITY_WORDS,
} from './constants/profanity-words';

@Injectable()
export class ProfanityFilterService {
  private readonly profanityWords = [
    ...ARABIC_PROFANITY_WORDS,
    ...ENGLISH_PROFANITY_WORDS,
  ].map((word) => this.normalize(word));

  normalize(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[ًٌٍَُِّْـ]/g, '')
      .replace(/\s+/g, ' ');
  }

  containsProfanity(text: string): boolean {
    const normalizedText = this.normalize(text);

    return this.profanityWords.some((word) => normalizedText.includes(word));
  }

  assertClean(text: string): void {
    if (this.containsProfanity(text)) {
      throw new BadRequestException('Message contains inappropriate language.');
    }
  }
}
