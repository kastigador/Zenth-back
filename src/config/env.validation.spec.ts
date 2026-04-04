import { envSchema } from './env.validation';

describe('env.validation', () => {
  const baseEnv = {
    JWT_ACCESS_SECRET: 'access-secret-123',
    JWT_REFRESH_SECRET: 'refresh-secret-123',
    DATABASE_URL: 'https://db.example.com',
    REDIS_URL: 'https://redis.example.com',
    STRIPE_SECRET_KEY: 'stripe-secret',
    STRIPE_WEBHOOK_SECRET: 'stripe-webhook',
    TWILIO_ACCOUNT_SID: 'twilio-sid',
    TWILIO_AUTH_TOKEN: 'twilio-token',
    TWILIO_WHATSAPP_FROM: 'whatsapp-from',
    TELEGRAM_BOT_TOKEN: 'telegram-token',
  };

  it('aplica defaults cuando faltan variables opcionales', () => {
    const result = envSchema.parse(baseEnv);

    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe(3000);
    expect(result.API_PREFIX).toBe('v1');
    expect(result.JWT_ACCESS_EXPIRES_IN).toBe('1h');
    expect(result.JWT_REFRESH_EXPIRES_IN).toBe('7d');
  });

  it('coercea PORT numérico y respeta overrides', () => {
    const result = envSchema.parse({
      ...baseEnv,
      NODE_ENV: 'production',
      PORT: '4000',
      API_PREFIX: 'api',
    });

    expect(result.NODE_ENV).toBe('production');
    expect(result.PORT).toBe(4000);
    expect(result.API_PREFIX).toBe('api');
  });

  it('falla cuando falta una variable requerida', () => {
    expect(() => envSchema.parse({ ...baseEnv, JWT_ACCESS_SECRET: '' })).toThrow();
  });
});
