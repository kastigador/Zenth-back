import { mkdtempSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { LocalStorageAdapter } from './local-storage.adapter';

describe('LocalStorageAdapter', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'crm-storage-'));
  const config = {
    get: (key: string, fallback?: string) => {
      if (key === 'STORAGE_LOCAL_ROOT') return root;
      if (key === 'STORAGE_PUBLIC_BASE_URL') return 'http://localhost:3000/assets';
      return fallback;
    },
  } as ConfigService;

  const adapter = new LocalStorageAdapter(config);

  it('guarda archivo local y devuelve metadata', async () => {
    const result = await adapter.put({
      content: Buffer.from('hello world'),
      fileName: 'demo.txt',
      mimeType: 'text/plain',
      folder: 'clients/avatar',
    });

    expect(result.key).toContain('clients/avatar/');
    expect(result.key.endsWith('.txt')).toBe(true);
    expect(result.url).toContain('/assets/clients/avatar/');
    expect(result.sizeBytes).toBe(11);
    expect(result.mimeType).toBe('text/plain');
    expect(existsSync(path.join(root, result.key))).toBe(true);
  });

  it('elimina archivo existente por key', async () => {
    const saved = await adapter.put({
      content: Buffer.from('bye'),
      fileName: 'remove.txt',
      mimeType: 'text/plain',
      folder: 'tmp',
    });

    await adapter.remove(saved.key);

    expect(existsSync(path.join(root, saved.key))).toBe(false);
  });
});
