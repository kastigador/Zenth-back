import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  providers: [ChatService, PrismaService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
