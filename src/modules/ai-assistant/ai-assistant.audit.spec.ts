import { AiAssistantAuditService } from './ai-assistant.audit';

describe('AiAssistantAuditService', () => {
  it('persiste auditoría con preview truncado y tools json', async () => {
    const prisma = {
      aiAssistantAudit: {
        create: jest.fn().mockResolvedValue({ ok: true }),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    } as any;

    const config = {
      get: jest.fn((key: string, fallback?: any) => {
        if (key === 'AI_AUDIT_RETENTION_DAYS') return 30;
        return fallback;
      }),
    } as any;

    const service = new AiAssistantAuditService(prisma, config);

    await service.record({
      userId: 'u1',
      userRole: 'admin',
      requestId: 'req-1',
      requestMessage: 'dame ventas',
      responsePreview: 'x'.repeat(900),
      sensitiveBlocked: false,
      tools: [{ type: 'sales', detail: 'payments:3' }],
    });

    expect(prisma.aiAssistantAudit.create).toHaveBeenCalled();
    const payload = prisma.aiAssistantAudit.create.mock.calls[0][0].data;
    expect(payload.responsePreview.length).toBeLessThanOrEqual(500);
    expect(payload.toolsJson).toEqual([{ type: 'sales', detail: 'payments:3' }]);
    expect(payload.requestId).toBe('req-1');
    expect(prisma.aiAssistantAudit.deleteMany).toHaveBeenCalled();
  });

  it('lista auditoría paginada y filtra blocked', async () => {
    const prisma = {
      aiAssistantAudit: {
        create: jest.fn().mockResolvedValue({ ok: true }),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'a1',
            userId: 'u1',
            userRole: 'admin',
            requestId: 'req-2',
            requestMessage: 'pedime ventas',
            responsePreview: 'ok',
            sensitiveBlocked: true,
            toolsJson: [{ type: 'policy', detail: 'blocked_sensitive_request' }],
            createdAt: new Date(),
          },
        ]),
      },
    } as any;

    const config = {
      get: jest.fn((key: string, fallback?: any) => {
        if (key === 'AI_AUDIT_RETENTION_DAYS') return 30;
        return fallback;
      }),
    } as any;

    const service = new AiAssistantAuditService(prisma, config);
    const result = await service.list({ page: 1, limit: 20, mode: 'blocked' });

    expect(prisma.aiAssistantAudit.count).toHaveBeenCalledWith({ where: { sensitiveBlocked: true } });
    expect(result.total).toBe(1);
    expect(result.items[0]?.requestId).toBe('req-2');
    expect(result.items[0]?.tools[0]?.type).toBe('policy');
  });
});
