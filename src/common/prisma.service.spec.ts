import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('onModuleInit conecta cliente', async () => {
    const service = new PrismaService();
    const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
  });

  it('onModuleDestroy desconecta cliente', async () => {
    const service = new PrismaService();
    const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue();

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});
