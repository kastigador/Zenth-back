import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { AiAuditItemDto, AiAuditListResponseDto } from './ai-assistant.dto';

type AuditEntry = {
  userId: string;
  userRole: string;
  requestId?: string;
  requestMessage: string;
  responsePreview: string;
  sensitiveBlocked: boolean;
  tools: Array<{ type: string; detail: string }>;
};

@Injectable()
export class AiAssistantAuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async record(entry: AuditEntry): Promise<void> {
    await this.cleanupExpired();

    await this.prisma.aiAssistantAudit.create({
      data: {
        userId: entry.userId,
        userRole: entry.userRole,
        requestId: entry.requestId,
        requestMessage: entry.requestMessage,
        responsePreview: entry.responsePreview.slice(0, 500),
        sensitiveBlocked: entry.sensitiveBlocked,
        toolsJson: entry.tools as any,
      },
    });
  }

  async list(input: { page: number; limit: number; mode: 'all' | 'blocked' }): Promise<AiAuditListResponseDto> {
    const skip = (input.page - 1) * input.limit;
    const where = input.mode === 'blocked' ? { sensitiveBlocked: true } : undefined;

    const [total, rows] = await Promise.all([
      this.prisma.aiAssistantAudit.count({ where }),
      this.prisma.aiAssistantAudit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: input.limit,
      }),
    ]);

    const items: AiAuditItemDto[] = rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      userRole: row.userRole,
      requestId: row.requestId ?? undefined,
      requestMessage: row.requestMessage,
      responsePreview: row.responsePreview,
      sensitiveBlocked: row.sensitiveBlocked,
      tools: Array.isArray(row.toolsJson) ? (row.toolsJson as AiAuditItemDto['tools']) : [],
      createdAt: row.createdAt,
    }));

    return {
      page: input.page,
      limit: input.limit,
      total,
      items,
    };
  }

  private async cleanupExpired(): Promise<void> {
    const retentionDays = this.config.get<number>('AI_AUDIT_RETENTION_DAYS', 30);
    const threshold = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    await this.prisma.aiAssistantAudit.deleteMany({
      where: {
        createdAt: { lt: threshold },
      },
    });
  }
}
