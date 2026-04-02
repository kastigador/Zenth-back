import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  it('genera codigo de vinculacion telegram de 6 digitos', () => {
    const service = new NotificationsService();

    const result = service.startTelegramLink('client-1');

    expect(result.code).toMatch(/^\d{6}$/);
  });

  it('confirma vinculacion con codigo valido', () => {
    const service = new NotificationsService();

    const start = service.startTelegramLink('client-1');
    const confirm = service.confirmTelegramLink(start.code, '987654321');

    expect(confirm.linked).toBe(true);
    expect(confirm.clientId).toBe('client-1');
  });

  it('envia notificacion y la registra en log', () => {
    const service = new NotificationsService();

    const result = service.sendPaymentNotification({
      clientId: 'client-1',
      paymentId: 'pay-1',
      channel: 'whatsapp',
      amount: 12000,
      description: 'Cuota marzo',
    });

    const logs = service.listLogs();

    expect(result.status).toBe('sent');
    expect(logs.items.length).toBe(1);
    expect(logs.items[0]?.channel).toBe('whatsapp');
  });

  it('lanza not found para codigo de vinculacion vencido/inexistente', () => {
    const service = new NotificationsService();

    expect(() => service.confirmTelegramLink('111111', '123')).toThrow(NotFoundException);
  });
});
