import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SendPaymentNotificationDto } from './notifications.dto';

type NotificationLog = {
  id: string;
  clientId: string;
  paymentId: string;
  channel: 'whatsapp' | 'telegram';
  status: 'sent' | 'failed';
  message: string;
  createdAt: string;
};

@Injectable()
export class NotificationsService {
  private readonly linkCodes = new Map<string, { clientId: string; createdAt: string }>();
  private readonly telegramByClient = new Map<string, string>();
  private readonly logs: NotificationLog[] = [];

  startTelegramLink(clientId: string) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.linkCodes.set(code, {
      clientId,
      createdAt: new Date().toISOString(),
    });
    return { code };
  }

  confirmTelegramLink(code: string, chatId: string) {
    const pending = this.linkCodes.get(code);
    if (!pending) {
      throw new NotFoundException('Link code not found');
    }

    this.telegramByClient.set(pending.clientId, chatId);
    this.linkCodes.delete(code);

    return {
      linked: true,
      clientId: pending.clientId,
      chatId,
    };
  }

  sendPaymentNotification(dto: SendPaymentNotificationDto) {
    const channels: Array<'whatsapp' | 'telegram'> =
      dto.channel === 'both' ? ['whatsapp', 'telegram'] : [dto.channel];

    let last: NotificationLog | null = null;
    for (const channel of channels) {
      const log: NotificationLog = {
        id: randomUUID(),
        clientId: dto.clientId,
        paymentId: dto.paymentId,
        channel,
        status: 'sent',
        message: `Pago confirmado ${dto.description ?? ''} por ${dto.amount}`.trim(),
        createdAt: new Date().toISOString(),
      };

      if (channel === 'telegram' && !this.telegramByClient.get(dto.clientId)) {
        log.status = 'failed';
        log.message = 'telegram_not_linked';
      }

      this.logs.push(log);
      last = log;
    }

    return {
      status: last?.status ?? 'failed',
      logsCreated: channels.length,
    };
  }

  listLogs() {
    return {
      items: this.logs,
      total: this.logs.length,
    };
  }
}
