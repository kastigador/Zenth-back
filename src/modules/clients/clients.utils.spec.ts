import {
  E164_REGEX,
  applyClientUpdate,
  buildClientRecord,
  createActivityRecord,
  filterClients,
  normalizeTags,
  paginate,
} from './clients.utils';

describe('clients.utils', () => {
  it('normalizeTags limpia, deduplica y elimina vacíos', () => {
    expect(normalizeTags([' vip ', 'vip', '', ' retail '])).toEqual(['vip', 'retail']);
  });

  it('buildClientRecord arma estructura base', () => {
    const now = '2026-04-04T00:00:00.000Z';
    const record = buildClientRecord(
      {
        businessName: 'Acme',
        contactName: 'Juan',
        email: 'juan@acme.com',
        phoneE164: '+5491112345678',
        address: 'Calle 123',
        tags: ['vip', 'vip'],
        notifyChannel: 'whatsapp',
      },
      now,
    );

    expect(record.businessName).toBe('Acme');
    expect(record.tags).toEqual(['vip']);
    expect(record.createdAt).toBe(now);
  });

  it('applyClientUpdate actualiza campos provistos y updatedAt', () => {
    const client: any = {
      businessName: 'Old',
      contactName: 'Old',
      email: 'old@test.com',
      phoneE164: '+5491111111111',
      address: 'Old',
      tags: ['old'],
      notifyChannel: 'whatsapp',
      telegramChatId: undefined,
      updatedAt: 'old',
    };

    applyClientUpdate(
      client,
      {
        businessName: 'New',
        contactName: 'Nuevo',
        email: 'new@test.com',
        phoneE164: '+5492222222222',
        address: 'Nueva',
        tags: ['vip', 'vip', 'retail'],
        notifyChannel: 'both',
        telegramChatId: '123',
      },
      'now',
    );

    expect(client.businessName).toBe('New');
    expect(client.tags).toEqual(['vip', 'retail']);
    expect(client.notifyChannel).toBe('both');
    expect(client.telegramChatId).toBe('123');
    expect(client.updatedAt).toBe('now');
  });

  it('filterClients respeta includeInactive, search y tag', () => {
    const clients: any[] = [
      {
        businessName: 'Acme',
        contactName: 'Juan',
        tags: ['vip'],
        isActive: true,
      },
      {
        businessName: 'Beta',
        contactName: 'Ana',
        tags: ['retail'],
        isActive: false,
      },
    ];

    expect(filterClients(clients, { page: 1, limit: 20 }).length).toBe(1);
    expect(filterClients(clients, { includeInactive: true, page: 1, limit: 20 }).length).toBe(2);
    expect(filterClients(clients, { search: 'acm', page: 1, limit: 20 }).length).toBe(1);
    expect(filterClients(clients, { tag: 'VIP', includeInactive: true, page: 1, limit: 20 }).length).toBe(1);
  });

  it('paginate devuelve slice esperado', () => {
    const result = paginate([1, 2, 3, 4, 5], 2, 2);

    expect(result).toEqual({ items: [3, 4], total: 5, page: 2, limit: 2 });
  });

  it('createActivityRecord genera evento con timestamp', () => {
    const event = createActivityRecord('c1', 'client.updated', 'updated', 'u1');

    expect(event.clientId).toBe('c1');
    expect(event.type).toBe('client.updated');
    expect(event.actorId).toBe('u1');
    expect(typeof event.timestamp).toBe('string');
  });

  it('E164_REGEX valida formato correcto', () => {
    expect(E164_REGEX.test('+5491112345678')).toBe(true);
    expect(E164_REGEX.test('5491112345678')).toBe(false);
  });
});
