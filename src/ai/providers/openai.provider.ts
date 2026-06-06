import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAiProvider {
  private client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async ask(prompt: string) {
    const response = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content!;
  }
}
