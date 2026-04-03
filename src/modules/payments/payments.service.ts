import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto, ListPaymentsQueryDto, StripeWebhookDto } from './payments.dto';
import { PaymentRecord } from './payments.types';
import {
  applyWebhookStatus,
  buildPaymentRecord,
  filterPayments,
  paginate,
  toCreateResponse,
} from './payments.utils';

@Injectable()
export class PaymentsService {
  private readonly payments: PaymentRecord[] = [];

  createPayment(input: CreatePaymentDto & { createdByUserId: string }) {
    const existing = this.payments.find((payment) => payment.idempotencyKey === input.idempotencyKey);
    if (existing) {
      return toCreateResponse(existing);
    }

    const now = new Date().toISOString();
    const payment = buildPaymentRecord(input, now);

    this.payments.push(payment);

    return toCreateResponse(payment);
  }

  listPayments(query: ListPaymentsQueryDto) {
    const now = new Date().toISOString();
    const filtered = filterPayments(this.payments, query, now);
    return paginate(filtered, query.page, query.limit);
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

    applyWebhookStatus(payment, dto.event.type);

    return {
      ok: true,
      paymentId: payment.id,
      status: payment.status,
    };
  }
}
