import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default('v1'),
  API_BODY_LIMIT: z.string().default('10mb'),
  JWT_ACCESS_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  JWT_ACCESS_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().min(8),
  STRIPE_WEBHOOK_SECRET: z.string().min(8),
  TWILIO_ACCOUNT_SID: z.string().min(5),
  TWILIO_AUTH_TOKEN: z.string().min(5),
  TWILIO_WHATSAPP_FROM: z.string().min(5),
  TELEGRAM_BOT_TOKEN: z.string().min(5),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_ROOT: z.string().default('/home/luis/Plantillas/proyectos-ia/crm-negocio/asset-varios/'),
  STORAGE_PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000/assets'),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value === 'true';
      return false;
    }),
});

export type Env = z.infer<typeof envSchema>;
