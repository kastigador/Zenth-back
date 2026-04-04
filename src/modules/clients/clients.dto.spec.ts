import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateClientDto, CreateTagDto, ListClientsQueryDto, UpdateClientDto } from './clients.dto';

describe('Clients DTOs', () => {
  it('CreateClientDto valida campos requeridos', () => {
    const dto = plainToInstance(CreateClientDto, {
      businessName: 'Acme',
      tags: ['vip'],
      notifyChannel: 'whatsapp',
      email: 'acme@test.com',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
  });

  it('UpdateClientDto permite campos opcionales', () => {
    const dto = plainToInstance(UpdateClientDto, {
      contactName: 'Nuevo',
      notifyChannel: 'both',
      tags: ['retail'],
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
  });

  it('ListClientsQueryDto transforma paginación e includeInactive', () => {
    const dto = plainToInstance(ListClientsQueryDto, {
      page: '2',
      limit: '50',
      includeInactive: 'true',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(50);
    expect(dto.includeInactive).toBe(true);
  });

  it('CreateTagDto falla con nombre vacío', () => {
    const dto = plainToInstance(CreateTagDto, { name: '' });
    const errors = validateSync(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
