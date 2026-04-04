import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

describe('ClientsController', () => {
  function makeController() {
    const service = {
      list: jest.fn(() => ({ items: [], total: 0, page: 1, limit: 20 })),
      create: jest.fn((dto, userId) => ({ id: 'c1', ...dto, createdBy: userId })),
      listTags: jest.fn(() => ({ items: ['vip'] })),
      createTag: jest.fn((name) => ({ ok: true, tag: name })),
      findById: jest.fn((id) => ({ id, businessName: 'Acme' })),
      update: jest.fn((id, dto, userId) => ({ id, ...dto, updatedBy: userId })),
      deactivate: jest.fn((id, userId) => ({ ok: true, id, userId })),
      history: jest.fn((id) => [{ id: 'h1', clientId: id }]),
    } as unknown as ClientsService;

    const controller = new ClientsController(service);
    return { controller, service };
  }

  it('delegates list query to service', () => {
    const { controller, service } = makeController();

    const result = controller.list({ page: 1, limit: 20 });

    expect(result.total).toBe(0);
    expect((service.list as jest.Mock).mock.calls.length).toBe(1);
  });

  it('create delega dto y userId', () => {
    const { controller, service } = makeController();

    controller.create({ businessName: 'Acme', notifyChannel: 'whatsapp' } as any, {
      sub: 'u1',
      email: 'u1@test.com',
      role: 'admin',
    });

    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({ businessName: 'Acme' }),
      'u1',
    );
  });

  it('listTags delega al servicio', () => {
    const { controller, service } = makeController();

    const result = controller.listTags();

    expect(service.listTags).toHaveBeenCalled();
    expect(result).toEqual({ items: ['vip'] });
  });

  it('createTag delega name al servicio', () => {
    const { controller, service } = makeController();

    controller.createTag({ name: 'nuevo' });

    expect(service.createTag).toHaveBeenCalledWith('nuevo');
  });

  it('findById delega id al servicio', () => {
    const { controller, service } = makeController();

    controller.findById('c1');

    expect(service.findById).toHaveBeenCalledWith('c1');
  });

  it('update delega id, dto y userId', () => {
    const { controller, service } = makeController();

    controller.update('c1', { businessName: 'Nuevo' } as any, {
      sub: 'u2',
      email: 'u2@test.com',
      role: 'vendedor',
    });

    expect(service.update).toHaveBeenCalledWith('c1', expect.objectContaining({ businessName: 'Nuevo' }), 'u2');
  });

  it('deactivate delega id y userId', () => {
    const { controller, service } = makeController();

    controller.deactivate('c1', {
      sub: 'u3',
      email: 'u3@test.com',
      role: 'admin',
    });

    expect(service.deactivate).toHaveBeenCalledWith('c1', 'u3');
  });

  it('history delega id al servicio', () => {
    const { controller, service } = makeController();

    controller.history('c1');

    expect(service.history).toHaveBeenCalledWith('c1');
  });
});
