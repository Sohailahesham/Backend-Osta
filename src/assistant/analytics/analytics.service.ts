import { Injectable } from '@nestjs/common';

type AnalyticsEvent = {
  event: string;
  data: any;
  createdAt: Date;
};

@Injectable()
export class AnalyticsService {
  private events: AnalyticsEvent[] = [];

  track(event: string, data: any) {
    this.events.push({ event, data, createdAt: new Date() });
  }

  getEvents() {
    return this.events;
  }
}
