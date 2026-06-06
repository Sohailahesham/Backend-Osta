import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';

export class AiException extends HttpException {
  constructor(message: string) {
    super(
      {
        success: false,
        message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}