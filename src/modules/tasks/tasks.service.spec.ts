import { NotFoundException } from '@nestjs/common';
import { TasksService } from './application/tasks.service';
import type { TasksRepository } from './application/tasks.repository';

describe('TasksService', () => {
  let service: TasksService;
  let repository: jest.Mocked<TasksRepository>;

  beforeEach(() => {
    repository = {
      listByUser: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    service = new TasksService(repository);
  });

  it('crea tarea para el usuario y la devuelve', async () => {
    repository.create.mockResolvedValueOnce({
      id: 'task-1',
      userId: 'user-1',
      title: 'Llamar cliente',
      priority: 'MEDIUM',
      description: 'Confirmar propuesta',
      done: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const result = await service.create('user-1', {
      title: 'Llamar cliente',
      priority: 'MEDIUM',
      description: 'Confirmar propuesta',
    });

    expect(result.userId).toBe('user-1');
    expect(result.title).toBe('Llamar cliente');
    expect(result.priority).toBe('MEDIUM');
    expect(result.done).toBe(false);
  });

  it('lista solo tareas del usuario solicitado', async () => {
    repository.listByUser.mockResolvedValueOnce([
      {
        id: 'task-1',
        userId: 'user-1',
        title: 'T1',
        priority: 'LOW',
        done: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    const result = await service.listByUser('user-1');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('T1');
  });

  it('actualiza tarea existente del mismo usuario', async () => {
    repository.update.mockResolvedValueOnce({
      id: 'task-1',
      userId: 'user-1',
      title: 'Actualizada',
      done: true,
      priority: 'HIGH',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const updated = await service.update('user-1', 'task-1', {
      title: 'Actualizada',
      done: true,
      priority: 'HIGH',
    });

    expect(updated.title).toBe('Actualizada');
    expect(updated.done).toBe(true);
    expect(updated.priority).toBe('HIGH');
  });

  it('lanza NotFound al actualizar tarea inexistente o ajena', async () => {
    repository.update.mockResolvedValue(null);

    await expect(service.update('user-2', 'task-1', { done: true })).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.update('user-1', 'missing-id', { done: true })).rejects.toBeInstanceOf(NotFoundException);
  });
});
