import { NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  it('crea un pago pending y devuelve client secret', () => {
    const service = new PaymentsService();

    const created = service.createPayment({
      clientId: 'client-1',
      amount: 25000,
      currency: 'ARS',
      description: 'Cuota marzo',
      dueDate: '2026-03-31T00:00:00.000Z',
      createdByUserId: 'user-1',
      idempotencyKey: 'idem-1',
    });

    expect(created.paymentId).toBeDefined();
    expect(created.clientSecret).toContain('pi_');
  });

  it('no duplica pago si llega mismo idempotency key', () => {
    const service = new PaymentsService();

    const first = service.createPayment({
      clientId: 'client-1',
      amount: 25000,
      currency: 'ARS',
      createdByUserId: 'user-1',
      idempotencyKey: 'idem-1',
    });

    const second = service.createPayment({
      clientId: 'client-1',
      amount: 25000,
      currency: 'ARS',
      createdByUserId: 'user-1',
      idempotencyKey: 'idem-1',
    });

    expect(first.paymentId).toBe(second.paymentId);
    expect(service.listPayments({ page: 1, limit: 20 }).total).toBe(1);
  });

  it('marca pago como paid con webhook success', () => {
    const service = new PaymentsService();
    const created = service.createPayment({
      clientId: 'client-1',
      amount: 25000,
      currency: 'ARS',
      createdByUserId: 'user-1',
      idempotencyKey: 'idem-1',
    });

    service.applyStripeWebhook({
      signature: 'valid-signature',
      event: {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: created.stripePaymentIntentId,
          },
        },
      },
    });

    const payment = service.getPayment(created.paymentId);
    expect(payment.status).toBe('paid');
  });

  it('lanza not found cuando payment intent no existe', () => {
    const service = new PaymentsService();

    expect(() =>
      service.applyStripeWebhook({
        signature: 'valid-signature',
        event: {
          type: 'payment_intent.succeeded',
          data: { object: { id: 'missing' } },
        },
      }),
    ).toThrow(NotFoundException);
  });
});
