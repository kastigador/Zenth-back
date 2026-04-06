export const STORAGE_PORT = Symbol('STORAGE_PORT');

export type StoragePutInput = {
  content: Buffer;
  mimeType: string;
  fileName: string;
  folder?: string;
};

export type StoredFile = {
  key: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
};

export interface StoragePort {
  put(input: StoragePutInput): Promise<StoredFile>;
  getPublicUrl(key: string): string;
  remove(key: string): Promise<void>;
}
