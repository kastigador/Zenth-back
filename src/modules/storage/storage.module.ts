import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { STORAGE_PORT } from './storage.port';
import { STORAGE_DRIVER_TOKEN } from './storage.tokens';
import { LocalStorageAdapter } from './infrastructure/local-storage.adapter';
import { S3StorageAdapter } from './infrastructure/s3-storage.adapter';

@Module({
  imports: [ConfigModule],
  providers: [
    LocalStorageAdapter,
    S3StorageAdapter,
    {
      provide: STORAGE_DRIVER_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get<'local' | 's3'>('STORAGE_DRIVER', 'local'),
    },
    {
      provide: STORAGE_PORT,
      inject: [STORAGE_DRIVER_TOKEN, LocalStorageAdapter, S3StorageAdapter],
      useFactory: (
        driver: 'local' | 's3',
        local: LocalStorageAdapter,
        s3: S3StorageAdapter,
      ) => {
        if (driver === 's3') {
          return s3;
        }
        return local;
      },
    },
  ],
  exports: [STORAGE_PORT, STORAGE_DRIVER_TOKEN],
})
export class StorageModule {}
