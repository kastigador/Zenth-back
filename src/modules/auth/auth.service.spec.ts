import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';

function makeService() {
  const jwt = {
    signAsync: jest.fn(async (payload: Record<string, unknown>, options?: { expiresIn?: string }) => {
      const suffix = options?.expiresIn ?? 'none';
      return `token-${String(payload.sub)}-${suffix}`;
    }),
    verifyAsync: jest.fn(async (token: string) => {
      if (token === 'valid-refresh') {
        return { sub: 'user-1', email: 'admin@crm.local', role: 'admin' };
      }
      throw new Error('invalid token');
    }),
  } as unknown as JwtService;

  const service = new AuthService(jwt);
  return { service, jwt };
}

describe('AuthService', () => {
  it('login devuelve access y refresh token cuando credenciales son validas', async () => {
    const { service } = makeService();
    const verifySpy = jest.spyOn(argon2, 'verify').mockResolvedValue(true);

    const result = await service.login('admin@crm.local', 'secret123');

    expect(result.user.email).toBe('admin@crm.local');
    expect(result.accessToken).toContain('1h');
    expect(result.refreshToken).toContain('7d');
    verifySpy.mockRestore();
  });

  it('login rechaza credenciales invalidas', async () => {
    const { service } = makeService();
    const verifySpy = jest.spyOn(argon2, 'verify').mockResolvedValue(false);

    await expect(service.login('admin@crm.local', 'bad-pass')).rejects.toBeInstanceOf(UnauthorizedException);
    verifySpy.mockRestore();
  });

  it('refresh devuelve access token nuevo con refresh token valido', async () => {
    const { service } = makeService();

    const result = await service.refresh('valid-refresh');

    expect(result.accessToken).toContain('1h');
  });

  it('refresh rechaza refresh token invalido', async () => {
    const { service } = makeService();

    await expect(service.refresh('invalid')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('hashPassword genera hash verificable', async () => {
    const { service } = makeService();

    const hash = await service.hashPassword('abc12345');

    await expect(argon2.verify(hash, 'abc12345')).resolves.toBe(true);
  });
});
