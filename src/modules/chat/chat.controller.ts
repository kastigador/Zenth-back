import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatMessageDto, ChatMessageResponseDto, GetChatMessagesQueryDto } from './chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/auth.types';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('messages')
  async createMessage(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateChatMessageDto,
  ): Promise<ChatMessageResponseDto> {
    return this.chatService.createMessage(user.sub, dto);
  }

  @Get('messages')
  async getMessages(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetChatMessagesQueryDto,
  ): Promise<ChatMessageResponseDto[]> {
    const limit = query.limit ? Math.min(parseInt(query.limit), 100) : 50;
    const offset = query.offset ? parseInt(query.offset) : 0;
    return this.chatService.getMessages(user.sub, limit, offset);
  }

  @Get('messages/:id')
  async getMessage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<ChatMessageResponseDto> {
    return this.chatService.getMessage(id, user.sub);
  }

  @Delete('messages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    return this.chatService.deleteMessage(id, user.sub);
  }

  @Delete('messages')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearMessages(@CurrentUser() user: JwtPayload): Promise<void> {
    return this.chatService.clearMessages(user.sub);
  }
}
