import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ClientsModule } from '../clients/clients.module';
import { PaymentsModule } from '../payments/payments.module';
import { UsersModule } from '../users/users.module';
import { AiAssistantController } from './ai-assistant.controller';
import { AiAssistantAuditService } from './ai-assistant.audit';
import { AiAssistantLlmClient } from './ai-assistant.llm';
import { AiAssistantSanitizer } from './ai-assistant.sanitizer';
import { AiAssistantService } from './ai-assistant.service';

@Module({
  imports: [PaymentsModule, ClientsModule, UsersModule],
  controllers: [AiAssistantController],
  providers: [AiAssistantService, AiAssistantSanitizer, AiAssistantLlmClient, AiAssistantAuditService, PrismaService],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
