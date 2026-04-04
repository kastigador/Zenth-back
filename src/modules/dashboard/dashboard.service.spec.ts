import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  it('calcula métricas agregadas y top clientes', () => {
    const paymentsService = {
      listPayments: jest.fn(() => ({
        items: [
          {
            id: 'p1',
            clientId: 'c1',
            status: 'paid',
            amount: 100,
            currency: 'ARS',
            paidAt: '2026-04-01',
            updatedAt: '2026-04-01T10:00:00.000Z',
          },
          {
            id: 'p2',
            clientId: 'c2',
            status: 'paid',
            amount: 300,
            currency: 'ARS',
            paidAt: '2026-04-02',
            updatedAt: '2026-04-02T10:00:00.000Z',
          },
          {
            id: 'p3',
            clientId: 'c1',
            status: 'pending',
            amount: 50,
            currency: 'ARS',
            updatedAt: '2026-04-03T10:00:00.000Z',
          },
          {
            id: 'p4',
            clientId: 'c3',
            status: 'overdue',
            amount: 25,
            currency: 'ARS',
            updatedAt: '2026-04-03T12:00:00.000Z',
          },
        ],
      })),
    } as any;

    const service = new DashboardService(paymentsService);

    const result = service.metrics('last_30_days');

    expect(paymentsService.listPayments).toHaveBeenCalledWith({ page: 1, limit: 2000 });
    expect(result.period).toBe('last_30_days');
    expect(result.totalCollected).toBe(400);
    expect(result.pending).toEqual({ count: 1, amount: 50 });
    expect(result.overdue).toEqual({ count: 1, amount: 25 });
    expect(result.topClients[0]).toEqual({ clientId: 'c2', amount: 300 });
    expect(result.lastPayments.map((p) => p.id)).toEqual(['p2', 'p1']);
  });
});
