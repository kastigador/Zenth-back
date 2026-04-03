import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';

export enum ChatMessageRoleEnum {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

export enum ChatMessageTypeEnum {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
}

export class CreateChatMessageDto {
  @IsNotEmpty()
  @IsEnum(ChatMessageRoleEnum)
  role!: ChatMessageRoleEnum;

  @IsNotEmpty()
  @IsEnum(ChatMessageTypeEnum)
  type!: ChatMessageTypeEnum;

  @IsNotEmpty()
  @IsString()
  text!: string;

  @IsOptional()
  @IsString()
  mediaUri?: string;

  @IsOptional()
  card?: Record<string, any>;
}

export class ChatMessageResponseDto {
  id!: string;
  userId!: string;
  role!: ChatMessageRoleEnum;
  type!: ChatMessageTypeEnum;
  text!: string;
  mediaUri?: string;
  card?: Record<string, any>;
  createdAt!: Date;
  updatedAt!: Date;
}

export class GetChatMessagesQueryDto {
  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  offset?: string;
}
