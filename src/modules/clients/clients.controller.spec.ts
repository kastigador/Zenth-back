import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

describe('ClientsController', () => {
  it('delegates list query to service', () => {
    const service = {
      list: jest.fn(() => ({ items: [], total: 0, page: 1, limit: 20 })),
    } as unknown as ClientsService;

    const controller = new ClientsController(service);

    const result = controller.list({ page: 1, limit: 20 });

    expect(result.total).toBe(0);
    expect((service.list as jest.Mock).mock.calls.length).toBe(1);
  });
});
