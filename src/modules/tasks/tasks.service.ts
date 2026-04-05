import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
import { TaskRecord } from './tasks.types';

@Injectable()
export class TasksService {
  private readonly tasks: TaskRecord[] = [];

  listByUser(userId: string) {
    return this.tasks
      .filter((task) => task.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  create(userId: string, dto: CreateTaskDto): TaskRecord {
    const now = new Date().toISOString();

    const task: TaskRecord = {
      id: randomUUID(),
      userId,
      title: dto.title.trim(),
      description: dto.description?.trim() || undefined,
      dueDate: dto.dueDate,
      priority: dto.priority,
      relatedTo: dto.relatedTo?.trim() || undefined,
      done: false,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.unshift(task);
    return task;
  }

  update(userId: string, id: string, dto: UpdateTaskDto): TaskRecord {
    const index = this.tasks.findIndex((task) => task.id === id && task.userId === userId);
    if (index < 0) {
      throw new NotFoundException('Task not found');
    }

    const current = this.tasks[index];
    const updated: TaskRecord = {
      ...current,
      title: dto.title?.trim() ?? current.title,
      description: dto.description !== undefined ? dto.description.trim() || undefined : current.description,
      dueDate: dto.dueDate ?? current.dueDate,
      priority: dto.priority ?? current.priority,
      relatedTo: dto.relatedTo !== undefined ? dto.relatedTo.trim() || undefined : current.relatedTo,
      done: dto.done ?? current.done,
      updatedAt: new Date().toISOString(),
    };

    this.tasks[index] = updated;
    return updated;
  }
}
