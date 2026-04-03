import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateClientDto,
  ListClientsQueryDto,
  UpdateClientDto,
} from './clients.dto';
import { ClientActivityRecord, ClientRecord } from './clients.types';
import {
  E164_REGEX,
  applyClientUpdate,
  buildClientRecord,
  createActivityRecord,
  filterClients,
  paginate,
} from './clients.utils';

@Injectable()
export class ClientsService {
  private readonly clients: ClientRecord[] = [];
  private readonly historyByClient = new Map<string, ClientActivityRecord[]>();
  private readonly tagsCatalog = new Set<string>(['vip', 'retail']);

  list(query: ListClientsQueryDto) {
    const filtered = filterClients(this.clients, query);
    return paginate(filtered, query.page, query.limit);
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
    const client = buildClientRecord(dto, now);

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

    applyClientUpdate(client, dto, new Date().toISOString());
    if (dto.tags !== undefined) {
      for (const tag of client.tags) {
        this.tagsCatalog.add(tag);
      }
    }
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
    existing.push(createActivityRecord(clientId, type, description, actorId));
    this.historyByClient.set(clientId, existing);
  }
}
