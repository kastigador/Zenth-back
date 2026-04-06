import { Injectable, NotImplementedException } from '@nestjs/common';
import type { StoragePort, StoragePutInput, StoredFile } from '../storage.port';

@Injectable()
export class S3StorageAdapter implements StoragePort {
  async put(_input: StoragePutInput): Promise<StoredFile> {
    throw new NotImplementedException('S3 adapter pending implementation. Switch STORAGE_DRIVER=local for now.');
  }

  getPublicUrl(key: string): string {
    return key;
  }

  async remove(_key: string): Promise<void> {
    throw new NotImplementedException('S3 adapter pending implementation. Switch STORAGE_DRIVER=local for now.');
  }
}
