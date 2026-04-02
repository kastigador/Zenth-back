import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreatePaymentDto, ListPaymentsQueryDto, StripeWebhookDto } from './payments.dto';

type PaymentStatus = 'pending' | 'paid' | 'failed' | 'overdue';

type PaymentRecord = {
  id: string;
  clientId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId: string;
  description?: string;
  dueDate?: string;
  paidAt?: string;
  createdByUserId: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class PaymentsService {
  private readonly payments: PaymentRecord[] = [];

  createPayment(input: CreatePaymentDto & { createdByUserId: string }) {
    const existing = this.payments.find((payment) => payment.idempotencyKey === input.idempotencyKey);
    if (existing) {
      return this.toCreateResponse(existing);
    }

    const now = new Date().toISOString();
    const payment: PaymentRecord = {
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
      createdAt: now,
      updatedAt: now,
    };

    this.payments.push(payment);

    return this.toCreateResponse(payment);
  }

  listPayments(query: ListPaymentsQueryDto) {
    const now = new Date().toISOString();

    const filtered = this.payments
      .map((payment) => {
        if (payment.status === 'pending' && payment.dueDate && payment.dueDate < now) {
          return { ...payment, status: 'overdue' as PaymentStatus };
        }
        return payment;
      })
      .filter((payment) => {
        const byClient = !query.clientId || payment.clientId === query.clientId;
        const byStatus = !query.status || payment.status === query.status;
        const byFrom = !query.from || payment.createdAt >= query.from;
        const byTo = !query.to || payment.createdAt <= query.to;
        return byClient && byStatus && byFrom && byTo;
      });

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const start = (page - 1) * limit;

    return {
      items: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
    };
  }

  getPayment(id: string) {
    const payment = this.payments.find((candidate) => candidate.id === id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  applyStripeWebhook(dto: StripeWebhookDto) {
    if (dto.signature !== 'valid-signature') {
      throw new BadRequestException('Invalid stripe signature');
    }

    const paymentIntentId = dto.event?.data?.object?.id;
    const payment = this.payments.find((candidate) => candidate.stripePaymentIntentId === paymentIntentId);
    if (!payment) {
      throw new NotFoundException('Payment for payment intent not found');
    }

    if (dto.event.type === 'payment_intent.succeeded') {
      payment.status = 'paid';
      payment.paidAt = new Date().toISOString();
    }

    if (dto.event.type === 'payment_intent.payment_failed') {
      payment.status = 'failed';
    }

    payment.updatedAt = new Date().toISOString();

    return {
      ok: true,
      paymentId: payment.id,
      status: payment.status,
    };
  }

  private toCreateResponse(payment: PaymentRecord) {
    return {
      paymentId: payment.id,
      clientSecret: `${payment.stripePaymentIntentId}_secret_demo`,
      amount: payment.amount,
      currency: payment.currency,
      stripePaymentIntentId: payment.stripePaymentIntentId,
    };
  }
}
