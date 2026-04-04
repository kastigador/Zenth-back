import { BadRequestException } from '@nestjs/common';
import { DecryptPayloadPipe } from './decrypt-payload.pipe';
import * as payloadCrypto from './payload-crypto';

describe('DecryptPayloadPipe', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('devuelve valor original cuando metadata no es body', () => {
    const pipe = new DecryptPayloadPipe('secret');
    const value = { a: 1 };

    expect(pipe.transform(value, { type: 'query' })).toBe(value);
  });

  it('devuelve valor original cuando no es objeto', () => {
    const pipe = new DecryptPayloadPipe('secret');

    expect(pipe.transform('hola', { type: 'body' })).toBe('hola');
  });

  it('devuelve valor original cuando body no es envelope', () => {
    jest.spyOn(payloadCrypto, 'isEncryptedPayloadEnvelope').mockReturnValue(false);
    const pipe = new DecryptPayloadPipe('secret');
    const value = { plain: true };

    expect(pipe.transform(value, { type: 'body' })).toBe(value);
  });

  it('lanza error cuando falta secret', () => {
    jest.spyOn(payloadCrypto, 'isEncryptedPayloadEnvelope').mockReturnValue(true);
    const pipe = new DecryptPayloadPipe('');

    expect(() => pipe.transform({ __enc: true }, { type: 'body' })).toThrow(BadRequestException);
  });

  it('lanza error cuando decrypt falla', () => {
    jest.spyOn(payloadCrypto, 'isEncryptedPayloadEnvelope').mockReturnValue(true);
    jest.spyOn(payloadCrypto, 'decryptPayloadEnvelope').mockImplementation(() => {
      throw new Error('boom');
    });

    const pipe = new DecryptPayloadPipe('secret');

    expect(() => pipe.transform({ __enc: true }, { type: 'body' })).toThrow(BadRequestException);
  });

  it('retorna payload desencriptado cuando envelope es valido', () => {
    jest.spyOn(payloadCrypto, 'isEncryptedPayloadEnvelope').mockReturnValue(true);
    jest.spyOn(payloadCrypto, 'decryptPayloadEnvelope').mockReturnValue({ ok: true });

    const pipe = new DecryptPayloadPipe('secret');
    const result = pipe.transform({ __enc: true }, { type: 'body' });

    expect(result).toEqual({ ok: true });
  });
});
