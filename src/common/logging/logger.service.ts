import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {
  log(
    event: string,
    payload: any,
  ) {
    console.log(
      JSON.stringify({
        timestamp:
          new Date().toISOString(),
        event,
        payload,
      }),
    );
  }
}