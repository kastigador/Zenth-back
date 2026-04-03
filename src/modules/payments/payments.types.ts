export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'overdue';

export type PaymentRecord = {
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

export type CreatePaymentResponse = {
  paymentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  stripePaymentIntentId: string;
};
