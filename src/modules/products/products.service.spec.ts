import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  it('crea producto y luego lo lista', () => {
    const service = new ProductsService();

    const created = service.create({
      sku: 'SKU-100',
      name: 'Plan mensual',
      basePrice: 12000,
      currency: 'ARS',
      isActive: true,
    });

    const result = service.list({ page: 1, limit: 20 });

    expect(created.sku).toBe('SKU-100');
    expect(result.total).toBe(1);
    expect(result.items[0]?.id).toBe(created.id);
  });

  it('filtra por activos y busqueda', () => {
    const service = new ProductsService();

    service.create({
      sku: 'SKU-100',
      name: 'Plan mensual',
      basePrice: 12000,
      currency: 'ARS',
      isActive: true,
    });
    service.create({
      sku: 'SKU-200',
      name: 'Plan anual',
      basePrice: 100000,
      currency: 'ARS',
      isActive: false,
    });

    const activeOnly = service.list({ active: true, page: 1, limit: 20 });
    const searched = service.list({ search: 'anual', page: 1, limit: 20 });

    expect(activeOnly.total).toBe(1);
    expect(searched.total).toBe(1);
    expect(searched.items[0]?.sku).toBe('SKU-200');
  });

  it('actualiza producto existente', () => {
    const service = new ProductsService();
    const created = service.create({
      sku: 'SKU-100',
      name: 'Plan mensual',
      basePrice: 12000,
      currency: 'ARS',
      isActive: true,
    });

    const updated = service.update(created.id, { name: 'Plan mensual Pro', isActive: false });

    expect(updated.name).toBe('Plan mensual Pro');
    expect(updated.isActive).toBe(false);
  });

  it('lanza not found para id inexistente', () => {
    const service = new ProductsService();

    expect(() => service.findById('missing')).toThrow(NotFoundException);
  });
});
