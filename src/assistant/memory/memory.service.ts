import { Injectable } from '@nestjs/common';

export type ConversationTurn = { role: 'user' | 'assistant'; content: string };

@Injectable()
export class MemoryService {
  private conversations = new Map<string, ConversationTurn[]>();

  save(conversationId: string, turn: ConversationTurn) {
    const existing = this.conversations.get(conversationId) ?? [];
    existing.push(turn);
    // Keep last 10 turns to avoid token bloat
    if (existing.length > 10) existing.shift();
    this.conversations.set(conversationId, existing);
  }

  get(conversationId: string): ConversationTurn[] {
    return this.conversations.get(conversationId) ?? [];
  }

  clear(conversationId: string) {
    this.conversations.delete(conversationId);
  }
}