import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';

describe('ClientsService', () => {
  it('crea cliente valido y lo lista', () => {
    const service = new ClientsService();

    const created = service.create(
      {
        businessName: 'Acme SRL',
        contactName: 'Juan Perez',
        email: 'juan@acme.com',
        phoneE164: '+5491112345678',
        address: 'Calle 123',
        tags: ['vip'],
        notifyChannel: 'whatsapp',
      },
      'user-1',
    );

    const listed = service.list({ page: 1, limit: 20 });

    expect(created.businessName).toBe('Acme SRL');
    expect(listed.total).toBe(1);
    expect(listed.items[0]?.id).toBe(created.id);
  });

  it('rechaza telefono no E164', () => {
    const service = new ClientsService();

    expect(() =>
      service.create(
        {
          businessName: 'Acme SRL',
          phoneE164: '1112345678',
          tags: [],
          notifyChannel: 'whatsapp',
        },
        'user-1',
      ),
    ).toThrow(BadRequestException);
  });

  it('filtra por tag y busqueda', () => {
    const service = new ClientsService();

    service.create(
      {
        businessName: 'Acme Mayorista',
        tags: ['vip'],
        notifyChannel: 'telegram',
      },
      'user-1',
    );
    service.create(
      {
        businessName: 'Beta Shop',
        tags: ['retail'],
        notifyChannel: 'whatsapp',
      },
      'user-1',
    );

    const filtered = service.list({ search: 'acme', tag: 'vip', page: 1, limit: 20 });

    expect(filtered.total).toBe(1);
    expect(filtered.items[0]?.businessName).toBe('Acme Mayorista');
  });

  it('actualiza cliente y registra actividad', () => {
    const service = new ClientsService();

    const created = service.create(
      {
        businessName: 'Acme',
        tags: ['vip'],
        notifyChannel: 'whatsapp',
      },
      'user-1',
    );

    const updated = service.update(
      created.id,
      {
        contactName: 'Maria',
        notifyChannel: 'both',
      },
      'user-2',
    );

    const history = service.history(created.id);

    expect(updated.contactName).toBe('Maria');
    expect(history.length).toBe(2);
    expect(history[1]?.type).toBe('client.updated');
  });

  it('desactiva cliente (soft delete)', () => {
    const service = new ClientsService();

    const created = service.create(
      {
        businessName: 'Acme',
        tags: [],
        notifyChannel: 'whatsapp',
      },
      'user-1',
    );

    service.deactivate(created.id, 'user-2');

    const detail = service.findById(created.id);
    expect(detail.isActive).toBe(false);
  });

  it('lanza not found para cliente inexistente', () => {
    const service = new ClientsService();

    expect(() => service.findById('missing')).toThrow(NotFoundException);
  });
});
