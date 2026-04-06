import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { STORAGE_PORT, type StoragePort } from './storage.port';
import { STORAGE_DRIVER_TOKEN } from './storage.tokens';
import { StorageModule } from './storage.module';

describe('StorageModule', () => {
  it('inyecta LocalStorageAdapter cuando STORAGE_DRIVER=local', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [StorageModule],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, fallback?: unknown) => (key === 'STORAGE_DRIVER' ? 'local' : fallback),
          },
        },
      ],
    })
      .compile();

    const driver = moduleRef.get<'local' | 's3'>(STORAGE_DRIVER_TOKEN);
    const storage = moduleRef.get<StoragePort>(STORAGE_PORT);

    expect(driver).toBe('local');
    expect(storage.constructor.name).toBe('LocalStorageAdapter');
  });
});
