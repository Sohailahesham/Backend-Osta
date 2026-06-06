export class ChatResponseDto {
  emergency!: boolean;

  category?: string;

  confidence?: number;

  explanation?: string;

  service?: any;

  technicians?: any[];

  suggestedCategory?: string;

  emergencyInfo?: any;
}