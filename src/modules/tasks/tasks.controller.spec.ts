import { TasksController } from './tasks.controller';
import { TasksService } from './application/tasks.service';

describe('TasksController', () => {
  function makeController() {
    const service = {
      listByUser: jest.fn(() => [{ id: 'task-1' }]),
      create: jest.fn(() => ({ id: 'task-1' })),
      update: jest.fn(() => ({ id: 'task-1' })),
    } as unknown as TasksService;

    return { controller: new TasksController(service), service };
  }

  const user = { sub: 'user-1', email: 'u@e.com', role: 'vendedor' as const };

  it('list delega userId al service', () => {
    const { controller, service } = makeController();

    controller.list(user);

    expect(service.listByUser).toHaveBeenCalledWith('user-1');
  });

  it('create delega userId y dto al service', () => {
    const { controller, service } = makeController();
    const dto = { title: 'Nueva', priority: 'MEDIUM' } as any;

    controller.create(user, dto);

    expect(service.create).toHaveBeenCalledWith('user-1', dto);
  });

  it('update delega userId, id y dto al service', () => {
    const { controller, service } = makeController();
    const dto = { done: true } as any;

    controller.update(user, 'task-1', dto);

    expect(service.update).toHaveBeenCalledWith('user-1', 'task-1', dto);
  });
});
