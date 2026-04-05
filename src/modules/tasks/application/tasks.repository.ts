import type { CreateTaskDto, UpdateTaskDto } from '../tasks.dto';
import type { TaskRecord } from '../domain/task.types';

export const TASKS_REPOSITORY = Symbol('TASKS_REPOSITORY');

export interface TasksRepository {
  listByUser(userId: string): Promise<TaskRecord[]>;
  create(userId: string, dto: CreateTaskDto): Promise<TaskRecord>;
  update(userId: string, id: string, dto: UpdateTaskDto): Promise<TaskRecord | null>;
}
