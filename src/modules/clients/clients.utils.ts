import { randomUUID } from 'crypto';
import { CreateClientDto, ListClientsQueryDto, UpdateClientDto } from './clients.dto';
import { ClientActivityRecord, ClientRecord } from './clients.types';

export const E164_REGEX = /^\+[1-9]\d{7,14}$/;

export function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
}

export function buildClientRecord(dto: CreateClientDto, nowIso: string): ClientRecord {
  return {
    id: randomUUID(),
    businessName: dto.businessName,
    contactName: dto.contactName,
    email: dto.email,
    phoneE164: dto.phoneE164,
    address: dto.address,
    tags: normalizeTags(dto.tags),
    notifyChannel: dto.notifyChannel,
    telegramChatId: undefined,
    isActive: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export function applyClientUpdate(client: ClientRecord, dto: UpdateClientDto, nowIso: string) {
  if (dto.businessName !== undefined) {
    client.businessName = dto.businessName;
  }
  if (dto.contactName !== undefined) {
    client.contactName = dto.contactName;
  }
  if (dto.email !== undefined) {
    client.email = dto.email;
  }
  if (dto.phoneE164 !== undefined) {
    client.phoneE164 = dto.phoneE164;
  }
  if (dto.address !== undefined) {
    client.address = dto.address;
  }
  if (dto.tags !== undefined) {
    client.tags = normalizeTags(dto.tags);
  }
  if (dto.notifyChannel !== undefined) {
    client.notifyChannel = dto.notifyChannel;
  }
  if (dto.telegramChatId !== undefined) {
    client.telegramChatId = dto.telegramChatId;
  }

  client.updatedAt = nowIso;
}

export function filterClients(clients: ClientRecord[], query: ListClientsQueryDto): ClientRecord[] {
  const includeInactive = query.includeInactive ?? false;
  const search = (query.search ?? '').trim().toLowerCase();
  const tag = (query.tag ?? '').trim().toLowerCase();

  return clients.filter((client) => {
    if (!includeInactive && !client.isActive) {
      return false;
    }

    const bySearch =
      search.length === 0 ||
      client.businessName.toLowerCase().includes(search) ||
      (client.contactName ?? '').toLowerCase().includes(search);

    const byTag = tag.length === 0 || client.tags.map((t) => t.toLowerCase()).includes(tag);

    return bySearch && byTag;
  });
}

export function paginate<T>(items: T[], page = 1, limit = 20) {
  const start = (page - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
  };
}

export function createActivityRecord(
  clientId: string,
  type: string,
  description: string,
  actorId: string,
): ClientActivityRecord {
  return {
    id: randomUUID(),
    clientId,
    type,
    description,
    actorId,
    timestamp: new Date().toISOString(),
  };
}
