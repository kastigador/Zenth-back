import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (rawEnv) => envSchema.parse(rawEnv),
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
  ],
})
export class AppModule {}
