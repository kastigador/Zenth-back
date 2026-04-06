import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type LlmGenerateInput = {
  userMessage: string;
  context: string;
  policy: string;
};

@Injectable()
export class AiAssistantLlmClient {
  constructor(private readonly config: ConfigService) {}

  async generate(input: LlmGenerateInput): Promise<string | null> {
    const provider = this.config.get<string>('AI_PROVIDER', 'none');
    if (provider !== 'openai') {
      return null;
    }

    const apiKey = this.config.get<string>('AI_API_KEY');
    if (!apiKey) {
      return null;
    }

    const model = this.config.get<string>('AI_MODEL', 'gpt-4o-mini');
    const timeoutMs = this.config.get<number>('AI_TIMEOUT_MS', 12000);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content: input.policy,
            },
            {
              role: 'system',
              content: `Contexto seguro:\n${input.context}`,
            },
            {
              role: 'user',
              content: input.userMessage,
            },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const text = data.choices?.[0]?.message?.content?.trim();
      return text || null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
}
