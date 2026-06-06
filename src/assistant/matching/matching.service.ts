import { Injectable } from '@nestjs/common';
import { CatalogService } from '../catalog/catalog.service';

@Injectable()
export class MatchingService {
  constructor(private readonly catalog: CatalogService) {}

  async match(message: string, categorySlug: string) {
    const allServices = await this.catalog.getServices();

    // Filter services belonging to this category.
    // The category field on each service is a populated object with { key, name }.
    const services = allServices.filter((s: any) => {
      const cat = s.category;
      if (!cat) return false;
      // populated object
      if (typeof cat === 'object' && cat.key) {
        return cat.key.toLowerCase() === categorySlug.toLowerCase();
      }
      return false;
    });

    let best: any = null;
    let bestScore = 0;

    for (const service of services) {
      // Score by matching message words against service name, description, and key
      const haystack = [
        (service as any).name ?? '',
        (service as any).description ?? '',
        (service as any).key ?? '',
      ]
        .join(' ')
        .toLowerCase();

      const words = message.toLowerCase().split(/\s+/);
      let score = 0;

      for (const word of words) {
        if (word.length > 2 && haystack.includes(word)) {
          score++;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        best = service;
      }
    }

    return {
      service: best,
      // Normalise confidence: at least 1 matching word = meaningful match
      confidence: best ? Math.min(bestScore / 3, 1) : 0,
    };
  }
}
