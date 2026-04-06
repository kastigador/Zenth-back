import { ConfigService } from '@nestjs/config';
import { AiAssistantLlmClient } from './ai-assistant.llm';

describe('AiAssistantLlmClient', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('retorna null cuando proveedor es none', async () => {
    const config = {
      get: jest.fn((key: string, fallback?: any) => {
        const values: Record<string, any> = { AI_PROVIDER: 'none' };
        return values[key] ?? fallback;
      }),
    } as unknown as ConfigService;

    const client = new AiAssistantLlmClient(config);
    const result = await client.generate({ userMessage: 'hola', context: 'ctx', policy: 'pol' });

    expect(result).toBeNull();
  });

  it('retorna null cuando openai falla', async () => {
    const config = {
      get: jest.fn((key: string, fallback?: any) => {
        const values: Record<string, any> = {
          AI_PROVIDER: 'openai',
          AI_API_KEY: 'demo-key',
          AI_MODEL: 'gpt-4o-mini',
          AI_TIMEOUT_MS: 1000,
        };
        return values[key] ?? fallback;
      }),
    } as unknown as ConfigService;

    global.fetch = jest.fn(async () => ({ ok: false })) as any;

    const client = new AiAssistantLlmClient(config);
    const result = await client.generate({ userMessage: 'hola', context: 'ctx', policy: 'pol' });

    expect(result).toBeNull();
  });

  it('retorna texto cuando openai responde ok', async () => {
    const config = {
      get: jest.fn((key: string, fallback?: any) => {
        const values: Record<string, any> = {
          AI_PROVIDER: 'openai',
          AI_API_KEY: 'demo-key',
          AI_MODEL: 'gpt-4o-mini',
          AI_TIMEOUT_MS: 1000,
        };
        return values[key] ?? fallback;
      }),
    } as unknown as ConfigService;

    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'respuesta llm' } }],
      }),
    })) as any;

    const client = new AiAssistantLlmClient(config);
    const result = await client.generate({ userMessage: 'hola', context: 'ctx', policy: 'pol' });

    expect(result).toBe('respuesta llm');
  });
});
