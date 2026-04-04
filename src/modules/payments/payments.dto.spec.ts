import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreatePaymentDto, ListPaymentsQueryDto } from './payments.dto';

describe('Payments DTOs', () => {
  it('CreatePaymentDto transforma amount a número', () => {
    const dto = plainToInstance(CreatePaymentDto, {
      clientId: 'c1',
      amount: '123',
      currency: 'ARS',
      idempotencyKey: 'key-1',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.amount).toBe(123);
  });

  it('CreatePaymentDto falla con amount inválido', () => {
    const dto = plainToInstance(CreatePaymentDto, {
      clientId: 'c1',
      amount: 0,
      currency: 'ARS',
      idempotencyKey: 'key-1',
    });

    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('ListPaymentsQueryDto respeta defaults y validación de status', () => {
    const dto = plainToInstance(ListPaymentsQueryDto, {
      page: '2',
      limit: '50',
      status: 'pending',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(50);
  });
});
