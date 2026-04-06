import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { LoggerModule } from 'nestjs-pino';
import { envSchema } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { ClientsModule } from './modules/clients/clients.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { ProductsModule } from './modules/products/products.module';
import { QueueModule } from './modules/queue/queue.module';
import { UsersModule } from './modules/users/users.module';
import { ChatModule } from './modules/chat/chat.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (rawEnv) => envSchema.parse(rawEnv),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        genReqId: (req, res) => {
          const headerValue = req.headers['x-request-id'];
          const requestId = (Array.isArray(headerValue) ? headerValue[0] : headerValue) ?? randomUUID();
          res.setHeader('x-request-id', requestId);
          return requestId;
        },
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.refreshToken',
            'res.headers.set-cookie',
          ],
          censor: '[REDACTED]',
        },
        customProps: (req) => ({
          requestId: req.id,
        }),
      },
    }),
    AuthModule,
    UsersModule,
    ClientsModule,
    ProductsModule,
    PricingModule,
    PaymentsModule,
    NotificationsModule,
    DashboardModule,
    QueueModule,
    ChatModule,
    TasksModule,
    StorageModule,
  ],
})
export class AppModule {}
