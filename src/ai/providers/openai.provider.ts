import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';

// This acts as the fallback provider using a second Groq model
@Injectable()
export class OpenAiProvider {
  private client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  async ask(prompt: string, history: Array<{ role: 'user' | 'assistant'; content: string }> = []) {
    const response = await this.client.chat.completions.create({
      model: process.env.GROQ_FALLBACK_MODEL ?? 'llama3-8b-8192',
      messages: [
        ...history,
        { role: 'user', content: prompt },
      ],
    });

    return response.choices[0].message.content!;
  }
}