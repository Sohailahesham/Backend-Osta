import {
  Injectable,
} from '@nestjs/common';

import Groq from 'groq-sdk';

@Injectable()
export class GroqProvider {
  private client =
    new Groq({
      apiKey:
        process.env.GROQ_API_KEY,
    });

  async ask(
    prompt: string,
  ) {
    const response =
      await this.client.chat.completions.create(
        {
          model:
            process.env.GROQ_MODEL!,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
      );

    return response.choices[0]
      .message.content!;
  }
}