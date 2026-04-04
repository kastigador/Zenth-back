import {
  NotificationsController,
  PaymentsNotificationsController,
} from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  function makeService() {
    return {
      startTelegramLink: jest.fn((clientId: string) => ({ code: '123456', clientId })),
      confirmTelegramLink: jest.fn((code: string, chatId: string) => ({ ok: true, code, chatId })),
      sendPaymentNotification: jest.fn((dto) => ({ ok: true, ...dto })),
      listLogs: jest.fn(() => ({ items: [] })),
    } as unknown as NotificationsService;
  }

  it('startLink delega clientId al servicio', () => {
    const service = makeService();
    const controller = new NotificationsController(service);

    controller.startLink({ clientId: 'client-1' });

    expect(service.startTelegramLink).toHaveBeenCalledWith('client-1');
  });

  it('confirmLink delega code y chatId al servicio', () => {
    const service = makeService();
    const controller = new NotificationsController(service);

    controller.confirmLink({ code: '999999', chatId: 'chat-1' });

    expect(service.confirmTelegramLink).toHaveBeenCalledWith('999999', 'chat-1');
  });

  it('sendPaymentNotification delega dto al servicio', () => {
    const service = makeService();
    const controller = new PaymentsNotificationsController(service);

    const dto = { paymentId: 'p-1', channel: 'telegram' } as any;
    controller.sendPaymentNotification(dto);

    expect(service.sendPaymentNotification).toHaveBeenCalledWith(dto);
  });

  it('listLogs delega al servicio', () => {
    const service = makeService();
    const controller = new PaymentsNotificationsController(service);

    controller.listLogs();

    expect(service.listLogs).toHaveBeenCalled();
  });
});
