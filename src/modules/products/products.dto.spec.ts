import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateProductDto, ListProductsQueryDto, UpdateProductDto } from './products.dto';

describe('Products DTOs', () => {
  it('CreateProductDto transforma basePrice e isActive', () => {
    const dto = plainToInstance(CreateProductDto, {
      sku: 'SKU-1',
      name: 'Producto',
      basePrice: '999.9',
      currency: 'ARS',
      isActive: 'true',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.basePrice).toBe(999.9);
    expect(dto.isActive).toBe(true);
  });

  it('UpdateProductDto falla con basePrice negativo', () => {
    const dto = plainToInstance(UpdateProductDto, {
      basePrice: '-1',
    });

    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('ListProductsQueryDto transforma active/page/limit', () => {
    const dto = plainToInstance(ListProductsQueryDto, {
      active: 'true',
      page: '2',
      limit: '30',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.active).toBe(true);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(30);
  });
});
