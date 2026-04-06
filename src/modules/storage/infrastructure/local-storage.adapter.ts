import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import type { StoragePort, StoragePutInput, StoredFile } from '../storage.port';

@Injectable()
export class LocalStorageAdapter implements StoragePort {
  constructor(private readonly config: ConfigService) {}

  async put(input: StoragePutInput): Promise<StoredFile> {
    const root = this.getRootDir();
    const folder = sanitizeSegment(input.folder ?? 'misc');
    const ext = extensionFromName(input.fileName);
    const fileName = `${Date.now()}-${randomUUID()}${ext}`;
    const relativeDir = folder;
    const relativePath = path.posix.join(relativeDir, fileName);
    const absoluteDir = path.join(root, relativeDir);
    const absolutePath = path.join(root, relativePath);

    await fs.mkdir(absoluteDir, { recursive: true });
    await fs.writeFile(absolutePath, input.content);

    return {
      key: relativePath,
      url: this.getPublicUrl(relativePath),
      sizeBytes: input.content.byteLength,
      mimeType: input.mimeType,
    };
  }

  getPublicUrl(key: string): string {
    const base = this.config.get<string>('STORAGE_PUBLIC_BASE_URL', 'http://localhost:3000/assets');
    return `${base.replace(/\/$/, '')}/${normalizeKey(key)}`;
  }

  async remove(key: string): Promise<void> {
    const root = this.getRootDir();
    const absolutePath = path.join(root, normalizeKey(key));
    await fs.rm(absolutePath, { force: true });
  }

  private getRootDir() {
    return this.config.get<string>('STORAGE_LOCAL_ROOT', '/home/luis/Plantillas/proyectos-ia/crm-negocio/asset-varios/');
  }
}

function extensionFromName(fileName: string) {
  const ext = path.extname(fileName || '').trim();
  if (!ext) return '';
  return ext.slice(0, 12);
}

function sanitizeSegment(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9-_./]/g, '-')
    .replace(/\.\./g, '-')
    .replace(/\/+/g, '/');
}

function normalizeKey(key: string) {
  return key.replace(/^\/+/, '').replace(/\\/g, '/');
}
