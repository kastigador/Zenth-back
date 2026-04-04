import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('ChatController', () => {
  function makeController() {
    const service = {
      createMessage: jest.fn(async () => ({ id: 'm1' })),
      getMessages: jest.fn(async () => []),
      getMessage: jest.fn(async () => ({ id: 'm1' })),
      deleteMessage: jest.fn(async () => undefined),
      clearMessages: jest.fn(async () => undefined),
    } as unknown as ChatService;

    return { controller: new ChatController(service), service };
  }

  const user = { sub: 'user-1', email: 'u@e.com', role: 'admin' as const };

  it('createMessage delega userId y dto', async () => {
    const { controller, service } = makeController();
    const dto = { role: 'user', content: 'hola' } as any;

    await controller.createMessage(user, dto);

    expect(service.createMessage).toHaveBeenCalledWith('user-1', dto);
  });

  it('getMessages aplica defaults de paginacion', async () => {
    const { controller, service } = makeController();

    await controller.getMessages(user, {} as any);

    expect(service.getMessages).toHaveBeenCalledWith('user-1', 50, 0);
  });

  it('getMessages limita maximo a 100', async () => {
    const { controller, service } = makeController();

    await controller.getMessages(user, { limit: '300', offset: '5' } as any);

    expect(service.getMessages).toHaveBeenCalledWith('user-1', 100, 5);
  });

  it('getMessage delega id y userId', async () => {
    const { controller, service } = makeController();

    await controller.getMessage(user, 'msg-1');

    expect(service.getMessage).toHaveBeenCalledWith('msg-1', 'user-1');
  });

  it('deleteMessage delega id y userId', async () => {
    const { controller, service } = makeController();

    await controller.deleteMessage(user, 'msg-1');

    expect(service.deleteMessage).toHaveBeenCalledWith('msg-1', 'user-1');
  });

  it('clearMessages delega userId', async () => {
    const { controller, service } = makeController();

    await controller.clearMessages(user);

    expect(service.clearMessages).toHaveBeenCalledWith('user-1');
  });
});
