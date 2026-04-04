import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  function makeController() {
    const service = {
      createPayment: jest.fn((payload) => ({ id: 'pay-1', ...payload })),
      listPayments: jest.fn((query) => ({ items: [], total: 0, ...query })),
      applyStripeWebhook: jest.fn((payload) => ({ ok: true, ...payload })),
    } as unknown as PaymentsService;

    return { controller: new PaymentsController(service), service };
  }

  it('create agrega createdByUserId desde el usuario autenticado', () => {
    const { controller, service } = makeController();

    const dto = { clientId: 'c1', amountCents: 1000, currency: 'ARS', method: 'card' } as any;
    const result = controller.create(dto, { sub: 'user-1', email: 'a@b.com', role: 'admin' });

    expect(service.createPayment).toHaveBeenCalledWith({ ...dto, createdByUserId: 'user-1' });
    expect(result).toEqual(expect.objectContaining({ id: 'pay-1' }));
  });

  it('list delega query al servicio', () => {
    const { controller, service } = makeController();

    const query = { status: 'pending', page: 1, limit: 20 } as any;
    controller.list(query);

    expect(service.listPayments).toHaveBeenCalledWith(query);
  });

  it('webhook delega firma y evento al servicio', () => {
    const { controller, service } = makeController();

    const event = {
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_1' } },
    } as const;

    controller.webhook('sig-123', event);

    expect(service.applyStripeWebhook).toHaveBeenCalledWith({
      signature: 'sig-123',
      event,
    });
  });
});
