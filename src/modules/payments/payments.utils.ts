import { randomUUID } from 'crypto';
import { CreatePaymentDto, ListPaymentsQueryDto } from './payments.dto';
import { CreatePaymentResponse, PaymentRecord, PaymentStatus } from './payments.types';

export function buildPaymentRecord(
  input: CreatePaymentDto & { createdByUserId: string },
  nowIso: string,
): PaymentRecord {
  return {
    id: randomUUID(),
    clientId: input.clientId,
    amount: input.amount,
    currency: input.currency,
    status: 'pending',
    stripePaymentIntentId: `pi_${randomUUID().replace(/-/g, '')}`,
    description: input.description,
    dueDate: input.dueDate,
    createdByUserId: input.createdByUserId,
    idempotencyKey: input.idempotencyKey,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export function toCreateResponse(payment: PaymentRecord): CreatePaymentResponse {
  return {
    paymentId: payment.id,
    clientSecret: `${payment.stripePaymentIntentId}_secret_demo`,
    amount: payment.amount,
    currency: payment.currency,
    stripePaymentIntentId: payment.stripePaymentIntentId,
  };
}

export function withComputedOverdue(payment: PaymentRecord, nowIso: string): PaymentRecord {
  if (payment.status === 'pending' && payment.dueDate && payment.dueDate < nowIso) {
    return { ...payment, status: 'overdue' as PaymentStatus };
  }

  return payment;
}

export function filterPayments(payments: PaymentRecord[], query: ListPaymentsQueryDto, nowIso: string): PaymentRecord[] {
  return payments
    .map((payment) => withComputedOverdue(payment, nowIso))
    .filter((payment) => {
      const byClient = !query.clientId || payment.clientId === query.clientId;
      const byStatus = !query.status || payment.status === query.status;
      const byFrom = !query.from || payment.createdAt >= query.from;
      const byTo = !query.to || payment.createdAt <= query.to;
      return byClient && byStatus && byFrom && byTo;
    });
}

export function paginate<T>(items: T[], page = 1, limit = 20) {
  const start = (page - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
  };
}

export function applyWebhookStatus(payment: PaymentRecord, eventType: string) {
  if (eventType === 'payment_intent.succeeded') {
    payment.status = 'paid';
    payment.paidAt = new Date().toISOString();
  }

  if (eventType === 'payment_intent.payment_failed') {
    payment.status = 'failed';
  }

  payment.updatedAt = new Date().toISOString();
}
