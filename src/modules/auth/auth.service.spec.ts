import { BadRequestException, UnauthorizedException } from '@nestjs/common';
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

describe('AuthService.register', () => {
  it('registra un usuario nuevo y devuelve access y refresh token', async () => {
    const { service } = makeService();

    const result = await service.register({
      name: 'Juan Pérez',
      email: 'nuevo@empresa.com',
      businessName: 'Ferretería García',
      password: 'segura123',
      userRole: 'dueno',
    });

    expect(result.user.email).toBe('nuevo@empresa.com');
    expect(result.user.name).toBe('Juan Pérez');
    expect(result.user.businessName).toBe('Ferretería García');
    expect(result.user.userRole).toBe('dueno');
    expect(result.accessToken).toContain('1h');
    expect(result.refreshToken).toContain('7d');
  });

  it('registra con rol admin', async () => {
    const { service } = makeService();

    const result = await service.register({
      name: 'Ana Admin',
      email: 'admin2@empresa.com',
      businessName: 'Mi Pyme',
      password: 'admin1234',
      userRole: 'admin',
    });

    expect(result.user.userRole).toBe('admin');
    expect(result.user.role).toBe('vendedor');
  });

  it('rechaza registro con email ya existente', async () => {
    const { service } = makeService();

    await service.register({
      name: 'Primero',
      email: 'repetido@empresa.com',
      businessName: 'Negocio A',
      password: 'pass1234',
      userRole: 'dueno',
    });

    await expect(
      service.register({
        name: 'Segundo',
        email: 'repetido@empresa.com',
        businessName: 'Negocio B',
        password: 'pass5678',
        userRole: 'empleado',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('email es case-insensitive al verificar duplicados', async () => {
    const { service } = makeService();

    await service.register({
      name: 'Carlos',
      email: 'carlos@empresa.com',
      businessName: 'Negocio C',
      password: 'pass1234',
      userRole: 'dueno',
    });

    await expect(
      service.register({
        name: 'Carlos 2',
        email: 'CARLOS@EMPRESA.COM',
        businessName: 'Negocio D',
        password: 'pass5678',
        userRole: 'empleado',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('el email registrado se normaliza a minúsculas', async () => {
    const { service } = makeService();

    const result = await service.register({
      name: 'Laura',
      email: 'Laura@Negocio.COM',
      businessName: 'Negocio L',
      password: 'pass1234',
      userRole: 'dueno',
    });

    expect(result.user.email).toBe('laura@negocio.com');
  });

  it('login funciona con usuario recién registrado', async () => {
    const { service } = makeService();

    await service.register({
      name: 'Nuevo User',
      email: 'nuevo2@empresa.com',
      businessName: 'Negocio N',
      password: 'clave5678',
      userRole: 'empleado',
    });

    const argonVerifySpy = jest.spyOn(argon2, 'verify').mockResolvedValue(true);
    const loginResult = await service.login('nuevo2@empresa.com', 'clave5678');

    expect(loginResult.user.email).toBe('nuevo2@empresa.com');
    argonVerifySpy.mockRestore();
  });
});
