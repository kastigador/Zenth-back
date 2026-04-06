import { AiAssistantController } from './ai-assistant.controller';
import { AiAssistantService } from './ai-assistant.service';
import { AiAssistantAuditService } from './ai-assistant.audit';

describe('AiAssistantController', () => {
  it('delega petición al servicio con user y body', async () => {
    const service = {
      resolveWithRequestId: jest.fn(async () => ({ answer: 'ok', sensitiveBlocked: false, sources: [] })),
    } as unknown as AiAssistantService;

    const auditService = {
      list: jest.fn(async () => ({ page: 1, limit: 20, total: 0, items: [] })),
    } as unknown as AiAssistantAuditService;

    const controller = new AiAssistantController(service, auditService);

    const user = { sub: 'u1', email: 'u1@test.com', role: 'admin' as const };
    const body = { message: 'resumen de ventas', maxItems: 5, includeFiles: false };
    const req = { headers: { 'x-request-id': 'req-123' } } as any;

    const result = await controller.chat(user, body, req);

    expect((service as any).resolveWithRequestId).toHaveBeenCalledWith(user, body, 'req-123');
    expect(result.answer).toBe('ok');
  });

  it('listAudit delega en audit service', async () => {
    const service = {
      resolveWithRequestId: jest.fn(async () => ({ answer: 'ok', sensitiveBlocked: false, sources: [] })),
    } as unknown as AiAssistantService;
    const auditService = {
      list: jest.fn(async () => ({ page: 1, limit: 10, total: 1, items: [{ id: 'a1' }] })),
    } as unknown as AiAssistantAuditService;

    const controller = new AiAssistantController(service, auditService);
    const result = await controller.listAudit({ page: 1, limit: 10, mode: 'all' });

    expect((auditService as any).list).toHaveBeenCalledWith({ page: 1, limit: 10, mode: 'all' });
    expect(result.total).toBe(1);
  });
});
