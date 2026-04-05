import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TASKS_REPOSITORY } from './application/tasks.repository';
import { TasksService } from './application/tasks.service';
import { PrismaTasksRepository } from './infrastructure/prisma-tasks.repository';
import { TasksController } from './tasks.controller';

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    PrismaService,
    PrismaTasksRepository,
    {
      provide: TASKS_REPOSITORY,
      useExisting: PrismaTasksRepository,
    },
  ],
  exports: [TasksService],
})
export class TasksModule {}
