import { BadRequestException } from '@nestjs/common';
import { EncryptedValidationPipe } from './encrypted-validation.pipe';
import * as payloadCrypto from './payload-crypto';

describe('EncryptedValidationPipe', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('pasa valor sin decrypt cuando no es body', async () => {
    const pipe = new EncryptedValidationPipe('secret', { transform: false });

    const result = await pipe.transform('hola', {
      type: 'query',
      data: undefined,
      metatype: undefined,
    });

    expect(result).toBe('hola');
  });

  it('lanza error cuando body está encriptado y no hay secret', async () => {
    jest.spyOn(payloadCrypto, 'isEncryptedPayloadEnvelope').mockReturnValue(true);
    const pipe = new EncryptedValidationPipe('', { transform: false });

    await expect(
      pipe.transform(
        { __enc: true },
        { type: 'body', data: undefined, metatype: undefined },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lanza error cuando decrypt falla', async () => {
    jest.spyOn(payloadCrypto, 'isEncryptedPayloadEnvelope').mockReturnValue(true);
    jest.spyOn(payloadCrypto, 'decryptPayloadEnvelope').mockImplementation(() => {
      throw new Error('boom');
    });
    const pipe = new EncryptedValidationPipe('secret', { transform: false });

    await expect(
      pipe.transform(
        { __enc: true },
        { type: 'body', data: undefined, metatype: undefined },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('desencripta body y pasa valor al ValidationPipe base', async () => {
    jest.spyOn(payloadCrypto, 'isEncryptedPayloadEnvelope').mockReturnValue(true);
    jest.spyOn(payloadCrypto, 'decryptPayloadEnvelope').mockReturnValue({ a: 1 });
    const pipe = new EncryptedValidationPipe('secret', { transform: false });

    const result = await pipe.transform(
      { __enc: true },
      { type: 'body', data: undefined, metatype: undefined },
    );

    expect(result).toEqual({ a: 1 });
  });
});
