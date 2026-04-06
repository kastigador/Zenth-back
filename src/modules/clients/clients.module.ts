import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { StorageModule } from '../storage/storage.module';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  imports: [StorageModule],
  controllers: [ClientsController],
  providers: [ClientsService, PrismaService],
  exports: [ClientsService],
})
export class ClientsModule {}
