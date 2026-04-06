import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/auth.types';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  AiAuditListResponseDto,
  AiChatRequestDto,
  AiChatResponseDto,
  ListAiAssistantAuditQueryDto,
} from './ai-assistant.dto';
import { AiAssistantAuditService } from './ai-assistant.audit';
import { AiAssistantService } from './ai-assistant.service';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiAssistantController {
  constructor(
    private readonly aiAssistantService: AiAssistantService,
    private readonly aiAssistantAuditService: AiAssistantAuditService,
  ) {}

  @Post('chat')
  async chat(
    @CurrentUser() user: JwtPayload,
    @Body() body: AiChatRequestDto,
    @Req() req: Request,
  ): Promise<AiChatResponseDto> {
    const requestId = req.headers['x-request-id'];
    const normalizedRequestId = Array.isArray(requestId) ? requestId[0] : requestId;
    return this.aiAssistantService.resolveWithRequestId(user, body, normalizedRequestId);
  }

  @Get('audit')
  @Roles('admin')
  async listAudit(@Query() query: ListAiAssistantAuditQueryDto): Promise<AiAuditListResponseDto> {
    return this.aiAssistantAuditService.list({
      page: query.page,
      limit: query.limit,
      mode: query.mode,
    });
  }
}
