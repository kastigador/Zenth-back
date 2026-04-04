import {
  applyWebhookStatus,
  buildPaymentRecord,
  filterPayments,
  paginate,
  toCreateResponse,
  withComputedOverdue,
} from './payments.utils';

describe('payments.utils', () => {
  it('buildPaymentRecord genera pending con stripePaymentIntentId', () => {
    const record = buildPaymentRecord(
      {
        clientId: 'c1',
        amount: 100,
        currency: 'ARS',
        idempotencyKey: 'idem-1',
        createdByUserId: 'u1',
      } as any,
      '2026-04-04T00:00:00.000Z',
    );

    expect(record.status).toBe('pending');
    expect(record.stripePaymentIntentId).toContain('pi_');
  });

  it('toCreateResponse mapea datos esperados', () => {
    const res = toCreateResponse({
      id: 'p1',
      amount: 100,
      currency: 'ARS',
      stripePaymentIntentId: 'pi_123',
    } as any);

    expect(res).toEqual({
      paymentId: 'p1',
      clientSecret: 'pi_123_secret_demo',
      amount: 100,
      currency: 'ARS',
      stripePaymentIntentId: 'pi_123',
    });
  });

  it('withComputedOverdue pasa a overdue cuando corresponde', () => {
    const overdue = withComputedOverdue(
      { status: 'pending', dueDate: '2026-04-01T00:00:00.000Z' } as any,
      '2026-04-02T00:00:00.000Z',
    );
    const same = withComputedOverdue(
      { status: 'paid', dueDate: '2026-04-01T00:00:00.000Z' } as any,
      '2026-04-02T00:00:00.000Z',
    );

    expect(overdue.status).toBe('overdue');
    expect(same.status).toBe('paid');
  });

  it('filterPayments aplica filtros por client/status/fechas', () => {
    const payments = [
      {
        clientId: 'c1',
        status: 'pending',
        createdAt: '2026-04-01T00:00:00.000Z',
        dueDate: '2026-04-10T00:00:00.000Z',
      },
      {
        clientId: 'c2',
        status: 'paid',
        createdAt: '2026-04-02T00:00:00.000Z',
      },
    ] as any[];

    const result = filterPayments(
      payments,
      { clientId: 'c2', status: 'paid', from: '2026-04-01T00:00:00.000Z', to: '2026-04-03T00:00:00.000Z' } as any,
      '2026-04-02T00:00:00.000Z',
    );

    expect(result).toHaveLength(1);
    expect(result[0].clientId).toBe('c2');
  });

  it('paginate devuelve bloque correcto', () => {
    expect(paginate([1, 2, 3, 4], 2, 2)).toEqual({ items: [3, 4], total: 4, page: 2, limit: 2 });
  });

  it('applyWebhookStatus actualiza estado y timestamps', () => {
    const paid = { status: 'pending' } as any;
    const failed = { status: 'pending' } as any;

    applyWebhookStatus(paid, 'payment_intent.succeeded');
    applyWebhookStatus(failed, 'payment_intent.payment_failed');

    expect(paid.status).toBe('paid');
    expect(typeof paid.paidAt).toBe('string');
    expect(typeof paid.updatedAt).toBe('string');
    expect(failed.status).toBe('failed');
    expect(typeof failed.updatedAt).toBe('string');
  });
});
