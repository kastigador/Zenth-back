import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import type { CreateTaskDto, UpdateTaskDto } from '../tasks.dto';
import type { TaskRecord } from '../domain/task.types';
import type { TasksRepository } from '../application/tasks.repository';

type PrismaTaskRow = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: TaskRecord['priority'];
  relatedTo: string | null;
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PrismaTasksRepository implements TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get taskTable() {
    return (this.prisma as unknown as { task: any }).task;
  }

  async listByUser(userId: string): Promise<TaskRecord[]> {
    const rows = (await this.taskTable.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })) as PrismaTaskRow[];

    return rows.map((row: PrismaTaskRow) => this.toRecord(row));
  }

  async create(userId: string, dto: CreateTaskDto): Promise<TaskRecord> {
    const row = (await this.taskTable.create({
      data: {
        userId,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        priority: dto.priority,
        relatedTo: dto.relatedTo?.trim() || null,
        done: false,
      },
    })) as PrismaTaskRow;

    return this.toRecord(row);
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<TaskRecord | null> {
    const existing = await this.taskTable.findFirst({ where: { id, userId } });

    if (!existing) {
      return null;
    }

    const row = (await this.taskTable.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? dto.title.trim() : undefined,
        description: dto.description !== undefined ? dto.description.trim() || null : undefined,
        dueDate: dto.dueDate !== undefined ? (dto.dueDate ? new Date(dto.dueDate) : null) : undefined,
        priority: dto.priority,
        relatedTo: dto.relatedTo !== undefined ? dto.relatedTo.trim() || null : undefined,
        done: dto.done,
      },
    })) as PrismaTaskRow;

    return this.toRecord(row);
  }

  private toRecord(row: PrismaTaskRow): TaskRecord {
    return {
      id: row.id,
      userId: row.userId,
      title: row.title,
      description: row.description ?? undefined,
      dueDate: row.dueDate?.toISOString(),
      priority: row.priority,
      relatedTo: row.relatedTo ?? undefined,
      done: row.done,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
