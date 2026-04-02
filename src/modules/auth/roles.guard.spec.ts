import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function makeContext(role: 'admin' | 'vendedor'): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: { role } }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('permite acceso cuando no hay metadata de roles', () => {
    const reflector = { getAllAndOverride: jest.fn(() => undefined) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    const canActivate = guard.canActivate(makeContext('vendedor'));

    expect(canActivate).toBe(true);
  });

  it('bloquea vendedor para endpoint admin', () => {
    const reflector = { getAllAndOverride: jest.fn(() => ['admin']) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    const canActivate = guard.canActivate(makeContext('vendedor'));

    expect(canActivate).toBe(false);
  });

  it('permite admin para endpoint admin', () => {
    const reflector = { getAllAndOverride: jest.fn(() => ['admin']) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    const canActivate = guard.canActivate(makeContext('admin'));

    expect(canActivate).toBe(true);
  });
});
