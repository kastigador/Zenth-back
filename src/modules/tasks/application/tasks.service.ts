import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TASKS_REPOSITORY, type TasksRepository } from './tasks.repository';
import type { CreateTaskDto, UpdateTaskDto } from '../tasks.dto';

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASKS_REPOSITORY)
    private readonly tasksRepository: TasksRepository,
  ) {}

  listByUser(userId: string) {
    return this.tasksRepository.listByUser(userId);
  }

  create(userId: string, dto: CreateTaskDto) {
    return this.tasksRepository.create(userId, dto);
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const updated = await this.tasksRepository.update(userId, id, dto);

    if (!updated) {
      throw new NotFoundException('Task not found');
    }

    return updated;
  }
}
