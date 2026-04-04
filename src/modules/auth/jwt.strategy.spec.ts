import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  function makeStrategy() {
    const config = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return 'test-secret';
        return undefined;
      }),
    } as unknown as ConfigService;

    const strategy = new JwtStrategy(config);
    return { strategy, config };
  }

  it('construye strategy leyendo JWT_ACCESS_SECRET', () => {
    const { config } = makeStrategy();

    expect(config.get).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
  });

  it('validate retorna payload valido', async () => {
    const { strategy } = makeStrategy();

    await expect(
      strategy.validate({ sub: 'u1', email: 'u1@test.com', role: 'admin' }),
    ).resolves.toEqual({ sub: 'u1', email: 'u1@test.com', role: 'admin' });
  });

  it('validate lanza UnauthorizedException con payload incompleto', async () => {
    const { strategy } = makeStrategy();

    await expect(
      strategy.validate({ sub: '', email: 'u1@test.com', role: 'admin' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('extractor prioriza bearer token sobre cookie', () => {
    const { strategy } = makeStrategy();

    const token = (strategy as any)._jwtFromRequest({
      headers: { authorization: 'Bearer bearer-token' },
      cookies: { crm_access_token: 'cookie-token' },
    });

    expect(token).toBe('bearer-token');
  });

  it('extractor usa cookie cuando no hay bearer token', () => {
    const { strategy } = makeStrategy();

    const token = (strategy as any)._jwtFromRequest({
      headers: {},
      cookies: { crm_access_token: 'cookie-token' },
    });

    expect(token).toBe('cookie-token');
  });
});
