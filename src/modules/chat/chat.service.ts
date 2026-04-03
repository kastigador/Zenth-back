import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { CreateChatMessageDto, ChatMessageResponseDto } from './chat.dto';
import { ChatMessageRoleEnum } from './chat.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage(userId: string, dto: CreateChatMessageDto): Promise<ChatMessageResponseDto> {
    const message = await this.prisma.chatMessage.create({
      data: {
        userId,
        role: dto.role,
        type: dto.type,
        text: dto.text,
        mediaUri: dto.mediaUri,
        card:
          dto.card === undefined
            ? undefined
            : (dto.card as Prisma.InputJsonValue),
      },
    });

    return this.mapToResponse(message);
  }

  async getMessages(userId: string, limit: number = 50, offset: number = 0): Promise<ChatMessageResponseDto[]> {
    const messages = await this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
    });

    return messages.map((msg: any) => this.mapToResponse(msg));
  }

  async getMessage(id: string, userId: string): Promise<ChatMessageResponseDto> {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Mensaje con ID ${id} no encontrado`);
    }

    if (message.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para acceder a este mensaje');
    }

    return this.mapToResponse(message);
  }

  async deleteMessage(id: string, userId: string): Promise<void> {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Mensaje con ID ${id} no encontrado`);
    }

    if (message.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este mensaje');
    }

    await this.prisma.chatMessage.delete({
      where: { id },
    });
  }

  async clearMessages(userId: string): Promise<void> {
    await this.prisma.chatMessage.deleteMany({
      where: { userId },
    });
  }

  private mapToResponse(message: any): ChatMessageResponseDto {
    return {
      id: message.id,
      userId: message.userId,
      role: message.role as ChatMessageRoleEnum,
      type: message.type,
      text: message.text,
      mediaUri: message.mediaUri,
      card: message.card,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }
}
