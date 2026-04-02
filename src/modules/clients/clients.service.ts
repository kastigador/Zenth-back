import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreateClientDto,
  ListClientsQueryDto,
  UpdateClientDto,
} from './clients.dto';
import { ClientActivityRecord, ClientRecord } from './clients.types';

const E164_REGEX = /^\+[1-9]\d{7,14}$/;

@Injectable()
export class ClientsService {
  private readonly clients: ClientRecord[] = [];
  private readonly historyByClient = new Map<string, ClientActivityRecord[]>();
  private readonly tagsCatalog = new Set<string>(['vip', 'retail']);

  list(query: ListClientsQueryDto) {
    const includeInactive = query.includeInactive ?? false;
    const search = (query.search ?? '').trim().toLowerCase();
    const tag = (query.tag ?? '').trim().toLowerCase();

    const filtered = this.clients.filter((client) => {
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

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const start = (page - 1) * limit;

    return {
      items: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
    };
  }

  findById(id: string) {
    const client = this.clients.find((candidate) => candidate.id === id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  history(id: string) {
    this.ensureClientExists(id);
    return this.historyByClient.get(id) ?? [];
  }

  create(dto: CreateClientDto, actorId: string) {
    this.assertPhoneValid(dto.phoneE164);

    const now = new Date().toISOString();
    const client: ClientRecord = {
      id: randomUUID(),
      businessName: dto.businessName,
      contactName: dto.contactName,
      email: dto.email,
      phoneE164: dto.phoneE164,
      address: dto.address,
      tags: [...new Set(dto.tags.map((tag) => tag.trim()).filter(Boolean))],
      notifyChannel: dto.notifyChannel,
      telegramChatId: undefined,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    for (const tag of client.tags) {
      this.tagsCatalog.add(tag);
    }

    this.clients.push(client);
    this.logActivity(client.id, 'client.created', `Client ${client.businessName} created`, actorId);

    return client;
  }

  update(id: string, dto: UpdateClientDto, actorId: string) {
    this.assertPhoneValid(dto.phoneE164);

    const client = this.findById(id);

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
      client.tags = [...new Set(dto.tags.map((tag) => tag.trim()).filter(Boolean))];
      for (const tag of client.tags) {
        this.tagsCatalog.add(tag);
      }
    }
    if (dto.notifyChannel !== undefined) {
      client.notifyChannel = dto.notifyChannel;
    }
    if (dto.telegramChatId !== undefined) {
      client.telegramChatId = dto.telegramChatId;
    }

    client.updatedAt = new Date().toISOString();
    this.logActivity(client.id, 'client.updated', `Client ${client.businessName} updated`, actorId);

    return client;
  }

  deactivate(id: string, actorId: string) {
    const client = this.findById(id);
    client.isActive = false;
    client.updatedAt = new Date().toISOString();

    this.logActivity(client.id, 'client.deactivated', `Client ${client.businessName} deactivated`, actorId);

    return { ok: true };
  }

  listTags() {
    return { items: [...this.tagsCatalog].sort() };
  }

  createTag(name: string) {
    const normalized = name.trim();
    if (!normalized) {
      throw new BadRequestException('Tag name is required');
    }

    this.tagsCatalog.add(normalized);
    return { ok: true, tag: normalized };
  }

  private ensureClientExists(clientId: string) {
    const exists = this.clients.some((client) => client.id === clientId);
    if (!exists) {
      throw new NotFoundException('Client not found');
    }
  }

  private assertPhoneValid(phone?: string) {
    if (!phone) {
      return;
    }

    if (!E164_REGEX.test(phone)) {
      throw new BadRequestException('invalid_phone_format');
    }
  }

  private logActivity(clientId: string, type: string, description: string, actorId: string) {
    const existing = this.historyByClient.get(clientId) ?? [];
    existing.push({
      id: randomUUID(),
      clientId,
      type,
      description,
      actorId,
      timestamp: new Date().toISOString(),
    });
    this.historyByClient.set(clientId, existing);
  }
}
