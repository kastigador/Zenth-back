import { createDecipheriv, createHash } from 'crypto';

export type EncryptedPayloadEnvelope = {
  __enc: true;
  alg: 'A256GCM';
  iv: string;
  data: string;
};

export function isEncryptedPayloadEnvelope(value: unknown): value is EncryptedPayloadEnvelope {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    candidate.__enc === true &&
    candidate.alg === 'A256GCM' &&
    typeof candidate.iv === 'string' &&
    typeof candidate.data === 'string'
  );
}

export function decryptPayloadEnvelope(envelope: EncryptedPayloadEnvelope, secret: string): unknown {
  const key = createHash('sha256').update(secret, 'utf8').digest();
  const iv = Buffer.from(envelope.iv, 'base64');
  const encrypted = Buffer.from(envelope.data, 'base64');

  if (encrypted.length <= 16) {
    throw new Error('Encrypted payload is invalid');
  }

  const authTag = encrypted.subarray(encrypted.length - 16);
  const ciphertext = encrypted.subarray(0, encrypted.length - 16);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decryptedBuffer = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(decryptedBuffer.toString('utf8'));
}
