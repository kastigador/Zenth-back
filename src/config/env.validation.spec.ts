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
    expect(result.LOG_LEVEL).toBe('info');
    expect(result.PORT).toBe(3000);
    expect(result.API_PREFIX).toBe('v1');
    expect(result.JWT_ACCESS_EXPIRES_IN).toBe('1h');
    expect(result.JWT_REFRESH_EXPIRES_IN).toBe('7d');
    expect(result.STORAGE_DRIVER).toBe('local');
    expect(result.STORAGE_LOCAL_ROOT).toBe('/home/luis/Plantillas/proyectos-ia/crm-negocio/asset-varios/');
    expect(result.STORAGE_PUBLIC_BASE_URL).toBe('http://localhost:3000/assets');
    expect(result.AI_PROVIDER).toBe('none');
    expect(result.AI_MODEL).toBe('gpt-4o-mini');
    expect(result.AI_TIMEOUT_MS).toBe(12000);
    expect(result.AI_AUDIT_RETENTION_DAYS).toBe(30);
    expect(result.S3_FORCE_PATH_STYLE).toBe(false);
  });

  it('coercea PORT numérico y respeta overrides', () => {
    const result = envSchema.parse({
      ...baseEnv,
      NODE_ENV: 'production',
      LOG_LEVEL: 'debug',
      PORT: '4000',
      API_PREFIX: 'api',
    });

    expect(result.NODE_ENV).toBe('production');
    expect(result.LOG_LEVEL).toBe('debug');
    expect(result.PORT).toBe(4000);
    expect(result.API_PREFIX).toBe('api');
  });

  it('falla cuando falta una variable requerida', () => {
    expect(() => envSchema.parse({ ...baseEnv, JWT_ACCESS_SECRET: '' })).toThrow();
  });

  it('falla cuando LOG_LEVEL no es válido', () => {
    expect(() => envSchema.parse({ ...baseEnv, LOG_LEVEL: 'verbose' })).toThrow();
  });

  it('interpreta S3_FORCE_PATH_STYLE desde string', () => {
    const result = envSchema.parse({
      ...baseEnv,
      STORAGE_DRIVER: 's3',
      S3_REGION: 'us-east-1',
      S3_BUCKET: 'crm-assets',
      S3_ACCESS_KEY_ID: 'demo-key',
      S3_SECRET_ACCESS_KEY: 'demo-secret',
      S3_FORCE_PATH_STYLE: 'true',
    });

    expect(result.S3_FORCE_PATH_STYLE).toBe(true);
  });
});
