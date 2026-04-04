import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  function makeController() {
    const service = {
      login: jest.fn(async () => ({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: 'u1', email: 'test@empresa.com', role: 'vendedor' },
      })),
      register: jest.fn(async () => ({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: { id: 'u2', email: 'new@empresa.com', role: 'vendedor' },
      })),
      refresh: jest.fn(async () => ({ accessToken: 'fresh-token' })),
    } as unknown as AuthService;

    const controller = new AuthController(service);
    const response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as Response;

    return { controller, service, response };
  }

  it('login delega al servicio y setea cookies', async () => {
    const { controller, service, response } = makeController();

    const result = await controller.login(
      { email: 'test@empresa.com', password: '123456' },
      response,
    );

    expect(service.login).toHaveBeenCalledWith('test@empresa.com', '123456');
    expect(result.accessToken).toBe('access-token');
    expect((response.cookie as jest.Mock).mock.calls.length).toBe(2);
  });

  it('register delega al servicio y setea cookies', async () => {
    const { controller, service, response } = makeController();

    const result = await controller.register(
      {
        name: 'Nuevo',
        email: 'new@empresa.com',
        businessName: 'Negocio',
        password: '123456',
        userRole: 'dueno',
      },
      response,
    );

    expect(service.register).toHaveBeenCalledWith({
      name: 'Nuevo',
      email: 'new@empresa.com',
      businessName: 'Negocio',
      password: '123456',
      userRole: 'dueno',
    });
    expect(result.refreshToken).toBe('new-refresh-token');
    expect((response.cookie as jest.Mock).mock.calls.length).toBe(2);
  });

  it('refresh usa refreshToken del body cuando existe', async () => {
    const { controller, service, response } = makeController();

    const result = await controller.refresh(
      { refreshToken: 'body-token' },
      { cookies: { crm_refresh_token: 'cookie-token' } } as unknown as Request,
      response,
    );

    expect(service.refresh).toHaveBeenCalledWith('body-token');
    expect(result.accessToken).toBe('fresh-token');
    expect((response.cookie as jest.Mock).mock.calls.length).toBe(1);
  });

  it('refresh usa refreshToken de cookies cuando body no lo trae', async () => {
    const { controller, service, response } = makeController();

    await controller.refresh(
      {},
      { cookies: { crm_refresh_token: 'cookie-token' } } as unknown as Request,
      response,
    );

    expect(service.refresh).toHaveBeenCalledWith('cookie-token');
  });

  it('logout limpia ambas cookies', async () => {
    const { controller, response } = makeController();

    const result = await controller.logout(response);

    expect(result).toEqual({ ok: true });
    expect((response.clearCookie as jest.Mock).mock.calls.length).toBe(2);
  });

  it('me devuelve usuario mapeado desde req.user', () => {
    const { controller } = makeController();

    const result = controller.me({
      user: { sub: 'u1', email: 'test@empresa.com', role: 'admin' },
    } as unknown as Request);

    expect(result).toEqual({
      user: {
        id: 'u1',
        email: 'test@empresa.com',
        role: 'admin',
      },
    });
  });
});
