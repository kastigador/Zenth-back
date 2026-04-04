import { createCipheriv, createHash, randomBytes } from 'crypto';
import {
  decryptPayloadEnvelope,
  isEncryptedPayloadEnvelope,
  type EncryptedPayloadEnvelope,
} from './payload-crypto';

function encryptPayload(payload: unknown, secret: string): EncryptedPayloadEnvelope {
  const key = createHash('sha256').update(secret, 'utf8').digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    __enc: true,
    alg: 'A256GCM',
    iv: iv.toString('base64'),
    data: Buffer.concat([encrypted, authTag]).toString('base64'),
  };
}

describe('payload-crypto', () => {
  it('isEncryptedPayloadEnvelope valida formato esperado', () => {
    expect(isEncryptedPayloadEnvelope(null)).toBe(false);
    expect(isEncryptedPayloadEnvelope({})).toBe(false);
    expect(
      isEncryptedPayloadEnvelope({
        __enc: true,
        alg: 'A256GCM',
        iv: 'abcd',
        data: 'efgh',
      }),
    ).toBe(true);
  });

  it('decryptPayloadEnvelope desencripta payload valido', () => {
    const secret = 'super-secret-key';
    const payload = { hello: 'world', count: 2 };
    const envelope = encryptPayload(payload, secret);

    const result = decryptPayloadEnvelope(envelope, secret);

    expect(result).toEqual(payload);
  });

  it('decryptPayloadEnvelope falla cuando payload cifrado es invalido', () => {
    const envelope: EncryptedPayloadEnvelope = {
      __enc: true,
      alg: 'A256GCM',
      iv: Buffer.alloc(12).toString('base64'),
      data: Buffer.from('short', 'utf8').toString('base64'),
    };

    expect(() => decryptPayloadEnvelope(envelope, 'secret')).toThrow('Encrypted payload is invalid');
  });
});
