import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  IsIn,
} from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @Transform(({ value }: { value: string | number }) => Number(value))
  @IsInt()
  @Min(1)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;
}

export class ListPaymentsQueryDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsIn(['pending', 'paid', 'failed', 'overdue'])
  status?: 'pending' | 'paid' | 'failed' | 'overdue';

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Transform(({ value }: { value: string | number }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }: { value: string | number }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

export class StripeWebhookDto {
  @IsString()
  @IsNotEmpty()
  signature!: string;

  event!: {
    type: 'payment_intent.succeeded' | 'payment_intent.payment_failed';
    data: {
      object: {
        id: string;
      };
    };
  };
}
