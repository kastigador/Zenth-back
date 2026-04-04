import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  function makeService() {
    const prisma = {
      chatMessage: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    } as any;

    return { service: new ChatService(prisma), prisma };
  }

  it('createMessage persiste y mapea respuesta', async () => {
    const { service, prisma } = makeService();
    const now = new Date();
    prisma.chatMessage.create.mockResolvedValue({
      id: 'm1',
      userId: 'u1',
      role: 'user',
      type: 'text',
      text: 'hola',
      mediaUri: null,
      card: null,
      createdAt: now,
      updatedAt: now,
    });

    const result = await service.createMessage('u1', {
      role: 'user',
      type: 'text',
      text: 'hola',
    } as any);

    expect(prisma.chatMessage.create).toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({ id: 'm1', userId: 'u1', text: 'hola' }));
  });

  it('getMessages retorna lista mapeada', async () => {
    const { service, prisma } = makeService();
    const now = new Date();
    prisma.chatMessage.findMany.mockResolvedValue([
      {
        id: 'm1',
        userId: 'u1',
        role: 'assistant',
        type: 'text',
        text: 'ok',
        mediaUri: null,
        card: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const result = await service.getMessages('u1', 10, 0);

    expect(prisma.chatMessage.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      orderBy: { createdAt: 'asc' },
      take: 10,
      skip: 0,
    });
    expect(result).toHaveLength(1);
  });

  it('getMessage lanza NotFound si no existe', async () => {
    const { service, prisma } = makeService();
    prisma.chatMessage.findUnique.mockResolvedValue(null);

    await expect(service.getMessage('x', 'u1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('getMessage lanza Forbidden si pertenece a otro usuario', async () => {
    const { service, prisma } = makeService();
    prisma.chatMessage.findUnique.mockResolvedValue({ id: 'm1', userId: 'u2' });

    await expect(service.getMessage('m1', 'u1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('getMessage devuelve mensaje cuando usuario coincide', async () => {
    const { service, prisma } = makeService();
    const now = new Date();
    prisma.chatMessage.findUnique.mockResolvedValue({
      id: 'm1',
      userId: 'u1',
      role: 'user',
      type: 'text',
      text: 'hola',
      mediaUri: null,
      card: null,
      createdAt: now,
      updatedAt: now,
    });

    const result = await service.getMessage('m1', 'u1');

    expect(result.id).toBe('m1');
  });

  it('deleteMessage lanza NotFound si no existe', async () => {
    const { service, prisma } = makeService();
    prisma.chatMessage.findUnique.mockResolvedValue(null);

    await expect(service.deleteMessage('x', 'u1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deleteMessage lanza Forbidden si pertenece a otro usuario', async () => {
    const { service, prisma } = makeService();
    prisma.chatMessage.findUnique.mockResolvedValue({ id: 'm1', userId: 'u2' });

    await expect(service.deleteMessage('m1', 'u1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('deleteMessage borra cuando usuario coincide', async () => {
    const { service, prisma } = makeService();
    prisma.chatMessage.findUnique.mockResolvedValue({ id: 'm1', userId: 'u1' });
    prisma.chatMessage.delete.mockResolvedValue({});

    await service.deleteMessage('m1', 'u1');

    expect(prisma.chatMessage.delete).toHaveBeenCalledWith({ where: { id: 'm1' } });
  });

  it('clearMessages elimina todos los mensajes del usuario', async () => {
    const { service, prisma } = makeService();

    await service.clearMessages('u1');

    expect(prisma.chatMessage.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u1' } });
  });
});
