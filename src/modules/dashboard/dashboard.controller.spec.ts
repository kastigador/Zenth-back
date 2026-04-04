import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  function makeController() {
    const service = {
      metrics: jest.fn((period: string) => ({ period, sales: 0 })),
    } as unknown as DashboardService;

    return { controller: new DashboardController(service), service };
  }

  it('metrics usa periodo por defecto cuando no se pasa query', () => {
    const { controller, service } = makeController();

    controller.metrics(undefined as unknown as string);

    expect(service.metrics).toHaveBeenCalledWith('current_month');
  });

  it('metrics delega periodo recibido', () => {
    const { controller, service } = makeController();

    controller.metrics('last_30_days');

    expect(service.metrics).toHaveBeenCalledWith('last_30_days');
  });
});
