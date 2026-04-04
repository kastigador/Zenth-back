import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';

describe('PricingController', () => {
  function makeController() {
    const service = {
      startImport: jest.fn((dto) => ({ jobId: 'job-1', ...dto })),
      getImportStatus: jest.fn((jobId) => ({ jobId, status: 'processing' })),
      listCurrentPrices: jest.fn((query) => ({ items: [], total: 0, ...query })),
    } as unknown as PricingService;

    return { controller: new PricingController(service), service };
  }

  it('importFile delega al servicio', () => {
    const { controller, service } = makeController();

    const dto = { fileUrl: 'https://example.com/prices.csv' } as any;
    controller.importFile(dto);

    expect(service.startImport).toHaveBeenCalledWith(dto);
  });

  it('getImportStatus delega jobId al servicio', () => {
    const { controller, service } = makeController();

    controller.getImportStatus('job-123');

    expect(service.getImportStatus).toHaveBeenCalledWith('job-123');
  });

  it('listCurrentPrices delega query al servicio', () => {
    const { controller, service } = makeController();

    const query = { search: 'yerba', page: 1, limit: 20 } as any;
    controller.listCurrentPrices(query);

    expect(service.listCurrentPrices).toHaveBeenCalledWith(query);
  });
});
