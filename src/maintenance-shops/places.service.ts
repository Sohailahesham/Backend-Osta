import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';

export interface MaintenanceShop {
  name: string;
  address: string;
  Maps_url: string;
}

@Injectable()
export class PlacesService {
  private readonly logger = new Logger(PlacesService.name);
  private readonly apiKey = process.env.GOOGLE_PLACES_API_KEY;
  private readonly baseUrl = 'https://places.googleapis.com/v1/places:searchText';
  private readonly fieldMask = 'places.displayName,places.formattedAddress,places.location';

  async searchShops(textQuery: string): Promise<MaintenanceShop[]> {
    if (!this.apiKey) {
      this.logger.error('GOOGLE_PLACES_API_KEY is not set');
      throw new ServiceUnavailableException('Places search is temporarily unavailable');
    }

    try {
      const { data } = await axios.post(
        this.baseUrl,
        { textQuery, languageCode: 'ar' },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': this.fieldMask,
          },
          timeout: 8000,
        },
      );

      return (data.places ?? []).map((p: any) => ({
        name: p.displayName?.text ?? '',
        address: p.formattedAddress ?? '',
        Maps_url: `https://www.google.com/maps/search/?api=1&query=${p.location?.latitude},${p.location?.longitude}`,
      }));
    } catch (err: any) {
      this.logger.error(`Places API error: ${err.message}`, err.response?.data);
      throw new ServiceUnavailableException('Failed to fetch nearby shops');
    }
  }
}