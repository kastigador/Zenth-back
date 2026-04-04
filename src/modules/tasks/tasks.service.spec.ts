import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(() => {
    service = new TasksService();
  });

  it('crea tarea para el usuario y la devuelve', () => {
    const result = service.create('user-1', {
      title: 'Llamar cliente',
      priority: 'MEDIUM',
      description: 'Confirmar propuesta',
    });

    expect(result.userId).toBe('user-1');
    expect(result.title).toBe('Llamar cliente');
    expect(result.priority).toBe('MEDIUM');
    expect(result.done).toBe(false);
  });

  it('lista solo tareas del usuario solicitado', () => {
    service.create('user-1', { title: 'T1', priority: 'LOW' });
    service.create('user-2', { title: 'T2', priority: 'HIGH' });

    const result = service.listByUser('user-1');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('T1');
  });

  it('actualiza tarea existente del mismo usuario', () => {
    const created = service.create('user-1', { title: 'Inicial', priority: 'LOW' });

    const updated = service.update('user-1', created.id, {
      title: 'Actualizada',
      done: true,
      priority: 'HIGH',
    });

    expect(updated.title).toBe('Actualizada');
    expect(updated.done).toBe(true);
    expect(updated.priority).toBe('HIGH');
  });

  it('lanza NotFound al actualizar tarea inexistente o ajena', () => {
    const created = service.create('user-1', { title: 'Privada', priority: 'LOW' });

    expect(() => service.update('user-2', created.id, { done: true })).toThrow(NotFoundException);
    expect(() => service.update('user-1', 'missing-id', { done: true })).toThrow(NotFoundException);
  });
});
