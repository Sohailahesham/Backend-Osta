import { Injectable } from '@nestjs/common';

@Injectable()
export class MemoryService {
  private conversations = new Map<string, string[]>();

  save(conversationId: string, message: string) {
    const existing = this.conversations.get(conversationId) || [];
    existing.push(message);
    this.conversations.set(conversationId, existing);
  }

  get(conversationId: string) {
    return this.conversations.get(conversationId) || [];
  }
}
