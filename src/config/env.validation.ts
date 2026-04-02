import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default('v1'),
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
});

export type Env = z.infer<typeof envSchema>;
