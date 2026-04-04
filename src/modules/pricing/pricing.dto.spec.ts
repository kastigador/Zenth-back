import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ImportPriceRowDto, ListPricesQueryDto, StartImportDto } from './pricing.dto';

describe('Pricing DTOs', () => {
  it('ImportPriceRowDto transforma price a número', () => {
    const dto = plainToInstance(ImportPriceRowDto, {
      sku: 'SKU-1',
      name: 'Yerba',
      price: '150.5',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.price).toBe(150.5);
  });

  it('StartImportDto valida rows no vacío', () => {
    const dto = plainToInstance(StartImportDto, { rows: [] });

    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('ListPricesQueryDto transforma paginación', () => {
    const dto = plainToInstance(ListPricesQueryDto, {
      search: 'yerba',
      page: '3',
      limit: '10',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(3);
    expect(dto.limit).toBe(10);
  });
});
