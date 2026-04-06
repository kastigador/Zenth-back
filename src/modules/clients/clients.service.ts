import { BadRequestException, Injectable, NotFoundException, OnModuleInit, Optional } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
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
export class ClientsService implements OnModuleInit {
  private readonly clients: ClientRecord[] = [];
  private readonly historyByClient = new Map<string, ClientActivityRecord[]>();
  private readonly tagsCatalog = new Set<string>(['vip', 'retail']);

  constructor(@Optional() private readonly prisma?: PrismaService) {}

  async onModuleInit() {
    if (!this.prisma) {
      return;
    }

    const dbClients = await this.prisma.client.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    this.clients.length = 0;
    for (const dbClient of dbClients) {
      const mapped: ClientRecord = {
        id: dbClient.id,
        businessName: dbClient.businessName,
        contactName: dbClient.contactName ?? undefined,
        avatarUrl: dbClient.avatarUrl ?? undefined,
        email: dbClient.email ?? undefined,
        phoneE164: dbClient.phoneE164 ?? undefined,
        address: dbClient.address ?? undefined,
        notifyChannel: dbClient.notifyChannel.toLowerCase() as ClientRecord['notifyChannel'],
        telegramChatId: dbClient.telegramChatId ?? undefined,
        tags: dbClient.tags,
        isActive: dbClient.isActive,
        createdAt: dbClient.createdAt.toISOString(),
        updatedAt: dbClient.updatedAt.toISOString(),
      };

      this.clients.push(mapped);

      for (const tag of mapped.tags) {
        this.tagsCatalog.add(tag);
      }
    }
  }

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

    if (this.prisma) {
      const notifyChannelMap = {
        whatsapp: 'WHATSAPP',
        telegram: 'TELEGRAM',
        both: 'BOTH',
      } as const;

      this.prisma.client
        .create({
          data: {
            id: client.id,
            businessName: client.businessName,
            contactName: client.contactName,
            avatarUrl: client.avatarUrl,
            email: client.email,
            phoneE164: client.phoneE164,
            address: client.address,
            notifyChannel: notifyChannelMap[client.notifyChannel],
            telegramChatId: client.telegramChatId,
            tags: client.tags,
            isActive: client.isActive,
          },
        })
        .catch(() => {
          // noop: mantener compatibilidad con modo memoria
        });
    }

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

    if (this.prisma) {
      const notifyChannelMap = {
        whatsapp: 'WHATSAPP',
        telegram: 'TELEGRAM',
        both: 'BOTH',
      } as const;

      this.prisma.client
        .update({
          where: { id },
          data: {
            businessName: client.businessName,
            contactName: client.contactName,
            avatarUrl: client.avatarUrl,
            email: client.email,
            phoneE164: client.phoneE164,
            address: client.address,
            notifyChannel: notifyChannelMap[client.notifyChannel],
            telegramChatId: client.telegramChatId,
            tags: client.tags,
            isActive: client.isActive,
          },
        })
        .catch(() => {
          // noop: mantener compatibilidad con modo memoria
        });
    }

    return client;
  }

  async updateAvatar(id: string, avatarUrl: string, actorId: string) {
    const client = this.findById(id);
    client.avatarUrl = avatarUrl;
    client.updatedAt = new Date().toISOString();

    this.logActivity(client.id, 'client.avatar.updated', `Avatar updated for ${client.businessName}`, actorId);

    if (this.prisma) {
      await this.prisma.client.update({
        where: { id },
        data: { avatarUrl },
      });
    }

    return client;
  }

  deactivate(id: string, actorId: string) {
    const client = this.findById(id);
    client.isActive = false;
    client.updatedAt = new Date().toISOString();

    this.logActivity(client.id, 'client.deactivated', `Client ${client.businessName} deactivated`, actorId);

    if (this.prisma) {
      this.prisma.client
        .update({
          where: { id },
          data: { isActive: false },
        })
        .catch(() => {
          // noop: mantener compatibilidad con modo memoria
        });
    }

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
