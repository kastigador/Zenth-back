import { Injectable } from '@nestjs/common';
import { PaymentsService } from '../payments/payments.service';
import { ClientsService } from '../clients/clients.service';
import { UsersService } from '../users/users.service';
import { JwtPayload } from '../auth/auth.types';
import { AiChatRequestDto, AiChatResponseDto, AiChatSource } from './ai-assistant.dto';
import { AiAssistantSanitizer } from './ai-assistant.sanitizer';
import { AiAssistantLlmClient } from './ai-assistant.llm';
import { AiAssistantAuditService } from './ai-assistant.audit';

@Injectable()
export class AiAssistantService {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly clientsService: ClientsService,
    private readonly usersService: UsersService,
    private readonly sanitizer: AiAssistantSanitizer,
    private readonly llmClient: AiAssistantLlmClient,
    private readonly auditService: AiAssistantAuditService,
  ) {}

  async resolve(user: JwtPayload, input: AiChatRequestDto): Promise<AiChatResponseDto> {
    return this.resolveWithRequestId(user, input);
  }

  async resolveWithRequestId(
    user: JwtPayload,
    input: AiChatRequestDto,
    requestId?: string,
  ): Promise<AiChatResponseDto> {
    const normalizedMessage = (input.message ?? '').trim();
    const lower = normalizedMessage.toLowerCase();

    if (this.sanitizer.containsBlockedIntent(lower)) {
      const blockedResponse: AiChatResponseDto = {
        answer:
          'No puedo revelar contraseñas, tokens, claves privadas ni datos sensibles. Puedo ayudarte con métricas de negocio, clientes y archivos permitidos.',
        sensitiveBlocked: true,
        sources: [{ type: 'policy', detail: 'blocked_sensitive_request' }],
      };

      await this.auditService.record({
        userId: user.sub,
        userRole: user.role,
        requestId,
        requestMessage: normalizedMessage,
        responsePreview: blockedResponse.answer,
        sensitiveBlocked: true,
        tools: blockedResponse.sources,
      });

      return blockedResponse;
    }

    const sources: AiChatSource[] = [];
    const sections: string[] = [];

    if (this.isSalesQuery(lower)) {
      const metrics = this.buildSalesSnapshot(user, input.maxItems);
      sections.push(metrics.text);
      sources.push({ type: 'sales', detail: metrics.detail });
    }

    if (this.isClientQuery(lower) || sections.length === 0) {
      const clients = this.buildClientSnapshot(user, input.maxItems);
      sections.push(clients.text);
      sources.push({ type: 'clients', detail: clients.detail });
    }

    if (input.includeFiles) {
      const files = await this.buildFileSnapshot(user, input.maxItems);
      sections.push(files.text);
      sources.push({ type: 'files', detail: files.detail });
    }

    const deterministicDraft = sections.join('\n\n');
    const policy = [
      'Sos un asistente de CRM orientado a negocio.',
      'NUNCA reveles contraseñas, hashes, tokens, API keys, cookies ni secretos.',
      'Si faltan datos, respondé de forma conservadora sin inventar.',
      'No muestres emails ni teléfonos completos; ya vienen redactados y deben seguir redactados.',
    ].join('\n');

    const llmDraft = await this.llmClient.generate({
      userMessage: normalizedMessage,
      context: deterministicDraft,
      policy,
    });

    const draft = llmDraft ?? deterministicDraft;
    const sanitized = this.sanitizer.sanitizeOutput(draft);

    const response: AiChatResponseDto = {
      answer: sanitized.text,
      sensitiveBlocked: sanitized.blocked,
      sources,
    };

    await this.auditService.record({
      userId: user.sub,
      userRole: user.role,
      requestId,
      requestMessage: normalizedMessage,
      responsePreview: response.answer,
      sensitiveBlocked: response.sensitiveBlocked,
      tools: response.sources,
    });

    return response;
  }

  private isSalesQuery(message: string): boolean {
    return /(venta|ventas|cobro|cobros|factur|ingreso|recaud|payment)/i.test(message);
  }

  private isClientQuery(message: string): boolean {
    return /(cliente|clientes|contacto|empresa|tag)/i.test(message);
  }

  private buildSalesSnapshot(user: JwtPayload, maxItems: number): { text: string; detail: string } {
    const roleSalesLimit = this.resolveRoleSalesLimit(user.role);
    if (roleSalesLimit <= 0) {
      return {
        detail: 'sales:denied_by_role',
        text: '📈 Resumen de ventas\n- Tu rol no tiene permisos para ver métricas de ventas completas.',
      };
    }

    const payments = this.paymentsService.listPayments({ page: 1, limit: 2000 }).items;

    const paid = payments.filter((p) => p.status === 'paid');
    const pending = payments.filter((p) => p.status === 'pending');
    const overdue = payments.filter((p) => p.status === 'overdue');

    const totalCollected = paid.reduce((sum, p) => sum + p.amount, 0);
    const topPaid = [...paid]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, Math.max(1, Math.min(maxItems, roleSalesLimit)));

    const topText =
      topPaid.length > 0
        ? topPaid.map((p) => `• ${p.clientId}: ${p.amount} ${p.currency.toUpperCase()}`).join('\n')
        : '• Sin pagos registrados todavía';

    return {
      detail: `payments:${payments.length}`,
      text: [
        '📈 Resumen de ventas',
        `- Total cobrado: ${totalCollected}`,
        `- Pendientes: ${pending.length}`,
        `- Vencidos: ${overdue.length}`,
        '- Top cobros:',
        topText,
      ].join('\n'),
    };
  }

  private buildClientSnapshot(user: JwtPayload, maxItems: number): { text: string; detail: string } {
    const roleClientLimit = this.resolveRoleClientLimit(user.role);
    if (roleClientLimit <= 0) {
      return {
        detail: 'clients:denied_by_role',
        text: '👥 Resumen de clientes\n- Tu rol no tiene permisos para listar clientes.',
      };
    }

    const listed = this.clientsService.list({ page: 1, limit: 2000 });
    const activeClients = listed.items.filter((c) => c.isActive);
    const top = activeClients.slice(0, Math.max(1, Math.min(maxItems, roleClientLimit)));

    const clientRows =
      top.length > 0
        ? top
            .map((c) => {
              const safeEmail = c.email ? '[REDACTED_EMAIL]' : '-';
              const safePhone = c.phoneE164 ? '[REDACTED_PHONE]' : '-';
              return `• ${c.businessName} | canal=${c.notifyChannel} | email=${safeEmail} | tel=${safePhone}`;
            })
            .join('\n')
        : '• Sin clientes activos';

    return {
      detail: `clients:${activeClients.length}`,
      text: ['👥 Resumen de clientes', `- Activos: ${activeClients.length}`, '- Muestra:', clientRows].join('\n'),
    };
  }

  private async buildFileSnapshot(user: JwtPayload, maxItems: number): Promise<{ text: string; detail: string }> {
    if (user.role !== 'admin') {
      return {
        detail: 'files:denied_by_role',
        text: '🗂️ Archivos permitidos (solo metadatos)\n- Tu rol no tiene permisos para explorar archivos.',
      };
    }

    const users = await this.usersService.listUsers();
    const ownUser = users.find((u) => u.id === user.sub);
    const avatars = users
      .filter((u) => Boolean(u.avatarUrl))
      .slice(0, Math.max(1, Math.min(maxItems, 10)))
      .map((u) => `• user:${u.id} -> ${this.maskUrl(u.avatarUrl ?? '')}`);

    const lines = avatars.length > 0 ? avatars.join('\n') : '• Sin archivos visibles para este usuario';

    return {
      detail: `user:${ownUser?.id ?? user.sub}`,
      text: ['🗂️ Archivos permitidos (solo metadatos)', '- Avatares visibles:', lines].join('\n'),
    };
  }

  private resolveRoleSalesLimit(role: JwtPayload['role']): number {
    return role === 'admin' ? 5 : 2;
  }

  private resolveRoleClientLimit(role: JwtPayload['role']): number {
    return role === 'admin' ? 10 : 3;
  }

  private maskUrl(url: string): string {
    if (!url) {
      return '';
    }

    try {
      const parsed = new URL(url);
      return `${parsed.origin}/assets/[REDACTED_PATH]`;
    } catch {
      return '[REDACTED_URL]';
    }
  }
}
