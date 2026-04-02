import { Injectable } from '@nestjs/common';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class DashboardService {
  constructor(private readonly paymentsService: PaymentsService) {}

  metrics(period = 'current_month') {
    const payments = this.paymentsService.listPayments({ page: 1, limit: 2000 }).items;

    const paid = payments.filter((payment) => payment.status === 'paid');
    const pending = payments.filter((payment) => payment.status === 'pending');
    const overdue = payments.filter((payment) => payment.status === 'overdue');

    const totalCollected = paid.reduce((sum, payment) => sum + payment.amount, 0);

    const byClient = new Map<string, number>();
    for (const payment of paid) {
      byClient.set(payment.clientId, (byClient.get(payment.clientId) ?? 0) + payment.amount);
    }

    const topClients = [...byClient.entries()]
      .map(([clientId, amount]) => ({ clientId, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const lastPayments = [...paid]
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
      .slice(0, 5)
      .map((payment) => ({
        id: payment.id,
        clientId: payment.clientId,
        amount: payment.amount,
        currency: payment.currency,
        paidAt: payment.paidAt,
      }));

    return {
      period,
      totalCollected,
      pending: {
        count: pending.length,
        amount: pending.reduce((sum, payment) => sum + payment.amount, 0),
      },
      overdue: {
        count: overdue.length,
        amount: overdue.reduce((sum, payment) => sum + payment.amount, 0),
      },
      lastPayments,
      topClients,
    };
  }
}
