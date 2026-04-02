import { NotFoundException } from '@nestjs/common';
import { PricingService } from './pricing.service';

describe('PricingService', () => {
  it('crea job de import y retorna resumen con errores por filas invalidas', () => {
    const service = new PricingService();

    const accepted = service.startImport({
      rows: [
        { sku: 'SKU-1', name: 'Producto 1', price: 100 },
        { sku: 'SKU-2', name: 'Producto 2', price: -50 },
        { sku: 'SKU-3', name: 'Producto 3', price: 200 },
      ],
    });

    const status = service.getImportStatus(accepted.jobId);

    expect(status.total).toBe(3);
    expect(status.processed).toBe(3);
    expect(status.success).toBe(2);
    expect(status.failed).toBe(1);
    expect(status.errors.length).toBe(1);
    expect(status.status).toBe('completed');
  });

  it('upsertea precio por sku en importaciones consecutivas', () => {
    const service = new PricingService();

    service.startImport({ rows: [{ sku: 'SKU-1', name: 'Producto 1', price: 100 }] });
    service.startImport({ rows: [{ sku: 'SKU-1', name: 'Producto 1', price: 140 }] });

    const prices = service.listCurrentPrices();

    expect(prices.items.length).toBe(1);
    expect(prices.items[0]?.price).toBe(140);
  });

  it('lanza not found para job inexistente', () => {
    const service = new PricingService();

    expect(() => service.getImportStatus('missing')).toThrow(NotFoundException);
  });
});
