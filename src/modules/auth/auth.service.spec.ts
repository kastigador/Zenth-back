import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';

function makeService(prismaMock?: {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  client?: {
    findFirst?: jest.Mock;
    create: jest.Mock;
  };
}) {
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

  const service = new AuthService(jwt, undefined, prismaMock as any);
  return { service, jwt, prismaMock };
}

describe('AuthService', () => {
  it('login devuelve access y refresh token cuando credenciales son validas', async () => {
    const { service } = makeService();
    const verifySpy = jest.spyOn(argon2, 'verify').mockResolvedValue(true);

    const result = await service.login('admin@crm.local', 'secret123');

      expect(result.user.email).toBe('admin@crm.local');
      expect(result.user).toHaveProperty('avatarUrl');
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

  it('login rechaza cuando el usuario no existe', async () => {
    const { service } = makeService();

    await expect(service.login('noexiste@empresa.com', 'secret123')).rejects.toBeInstanceOf(UnauthorizedException);
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

  it('verifyPassword valida hash y password plano', async () => {
    const { service } = makeService();
    const hash = await argon2.hash('clave-segura');

    await expect(service.verifyPassword(hash, 'clave-segura')).resolves.toBe(true);
    await expect(service.verifyPassword(hash, 'otra-clave')).resolves.toBe(false);
  });

  it('verifyAccessToken delega en jwtService', async () => {
    const { service, jwt } = makeService();
    (jwt.verifyAsync as jest.Mock).mockResolvedValueOnce({
      sub: 'user-1',
      email: 'admin@crm.local',
      role: 'admin',
    });

    await expect(service.verifyAccessToken('token-123')).resolves.toEqual({
      sub: 'user-1',
      email: 'admin@crm.local',
      role: 'admin',
    });
    expect(jwt.verifyAsync).toHaveBeenCalledWith('token-123', {
      secret: 'dev-access-secret',
    });
  });

  it('getDemoUsers expone usuarios sin passwordHash', () => {
    const { service } = makeService();

    const result = service.getDemoUsers();

    expect(result.users.length).toBeGreaterThan(0);
    expect(result.users[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
        role: expect.any(String),
      }),
    );
    expect((result.users[0] as Record<string, unknown>).passwordHash).toBeUndefined();
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
    expect(result.user).toHaveProperty('avatarUrl');
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

  it('persiste usuario en Prisma cuando PrismaService está disponible', async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'db-user-1',
          name: 'Persistido',
          email: 'persistido@empresa.com',
          passwordHash: 'hash',
          role: 'SELLER',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
      client: {
        create: jest.fn().mockResolvedValue({ id: 'db-client-1' }),
      },
    };

    const { service } = makeService(prismaMock);

    const result = await service.register({
      name: 'Persistido',
      email: 'persistido@empresa.com',
      businessName: 'Negocio Persistente',
      password: 'pass1234',
      userRole: 'dueno',
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'persistido@empresa.com' },
    });
    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(prismaMock.client.create).toHaveBeenCalledWith({
      data: {
        businessName: 'Negocio Persistente',
        contactName: 'Persistido',
        email: 'persistido@empresa.com',
        tags: [],
        isActive: true,
      },
    });
    expect(result.user.id).toBe('db-user-1');
    expect(result.user.role).toBe('vendedor');
  });

  it('rechaza registro cuando email ya existe en Prisma', async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'existing-db',
          email: 'existente@empresa.com',
        }),
        create: jest.fn(),
      },
      client: {
        create: jest.fn(),
      },
    };

    const { service } = makeService(prismaMock);

    await expect(
      service.register({
        name: 'Duplicado',
        email: 'existente@empresa.com',
        businessName: 'Negocio X',
        password: 'pass1234',
        userRole: 'empleado',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.client.create).not.toHaveBeenCalled();
  });

  it('login usa usuario de Prisma cuando existe en BBDD', async () => {
    const hash = await argon2.hash('clave1234');
    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'db-login-1',
          name: 'DB User',
          email: 'dbuser@empresa.com',
          passwordHash: hash,
          avatarUrl: 'http://localhost:3000/assets/users/db-login-1/avatar/demo.jpg',
          role: 'SELLER',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        create: jest.fn(),
      },
      client: {
        findFirst: jest.fn().mockResolvedValue({ id: 'existing-client' }),
        create: jest.fn(),
      },
    };

    const { service } = makeService(prismaMock);
    const result = await service.login('dbuser@empresa.com', 'clave1234');

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'dbuser@empresa.com' },
    });
    expect(prismaMock.client.findFirst).toHaveBeenCalledWith({
      where: { email: 'dbuser@empresa.com' },
    });
    expect(prismaMock.client.create).not.toHaveBeenCalled();
    expect(result.user.id).toBe('db-login-1');
    expect(result.user.role).toBe('vendedor');
    expect(result.user.avatarUrl).toBe('http://localhost:3000/assets/users/db-login-1/avatar/demo.jpg');
  });

  it('login crea cliente si el usuario existe pero no tiene cliente asociado', async () => {
    const hash = await argon2.hash('clave1234');
    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'db-login-2',
          name: 'Sin Cliente',
          email: 'sincliente@empresa.com',
          passwordHash: hash,
          avatarUrl: null,
          role: 'SELLER',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        create: jest.fn(),
      },
      client: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'new-client' }),
      },
    };

    const { service } = makeService(prismaMock);
    await service.login('sincliente@empresa.com', 'clave1234');

    expect(prismaMock.client.findFirst).toHaveBeenCalledWith({
      where: { email: 'sincliente@empresa.com' },
    });
    expect(prismaMock.client.create).toHaveBeenCalledWith({
      data: {
        businessName: 'Sin Cliente',
        contactName: 'Sin Cliente',
        email: 'sincliente@empresa.com',
        tags: [],
        isActive: true,
      },
    });
  });
});
