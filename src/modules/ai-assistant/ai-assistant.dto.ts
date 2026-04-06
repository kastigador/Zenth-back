import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class AiChatRequestDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsOptional()
  @IsBoolean()
  includeFiles?: boolean;

  @IsOptional()
  @Transform(({ value }: { value: string | number }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  maxItems: number = 10;
}

export type AiChatSourceType = 'sales' | 'clients' | 'files' | 'policy';

export type AiChatSource = {
  type: AiChatSourceType;
  detail: string;
};

export class AiChatResponseDto {
  answer!: string;
  sensitiveBlocked!: boolean;
  sources!: AiChatSource[];
}

export class ListAiAssistantAuditQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: string | number }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }: { value: string | number }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsIn(['all', 'blocked'])
  mode: 'all' | 'blocked' = 'all';
}

export type AiAuditItemDto = {
  id: string;
  userId: string;
  userRole: string;
  requestId?: string;
  requestMessage: string;
  responsePreview: string;
  sensitiveBlocked: boolean;
  tools: Array<{ type: string; detail: string }>;
  createdAt: Date;
};

export type AiAuditListResponseDto = {
  page: number;
  limit: number;
  total: number;
  items: AiAuditItemDto[];
};
