import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StartTelegramLinkDto {
  @IsString()
  @IsNotEmpty()
  clientId!: string;
}

export class ConfirmTelegramLinkDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  chatId!: string;
}

export class SendPaymentNotificationDto {
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @IsString()
  @IsNotEmpty()
  paymentId!: string;

  @IsIn(['whatsapp', 'telegram', 'both'])
  channel!: 'whatsapp' | 'telegram' | 'both';

  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
