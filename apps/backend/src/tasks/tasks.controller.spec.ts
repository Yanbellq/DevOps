import { describe, expect, it, vi } from 'vite-plus/test';

import { TasksController } from './tasks.controller';

import type { TasksService } from './tasks.service';

describe('TasksController', () => {
  it('delegates CRUD operations to TasksService', async () => {
    const findAll = vi
      .fn<(status?: string) => Promise<Array<{ id: string; title: string }>>>()
      .mockResolvedValue([{ id: '1', title: 'CI pipeline' }]);
    const mockService = {
      findAll,
      findOne: vi.fn<() => Promise<{ id: string; title: string }>>().mockResolvedValue({
        id: '1',
        title: 'CI pipeline',
      }),
      create: vi.fn<() => Promise<{ id: string; title: string }>>().mockResolvedValue({
        id: '1',
        title: 'CI pipeline',
      }),
      update: vi.fn<() => Promise<{ id: string; status: string }>>().mockResolvedValue({
        id: '1',
        status: 'done',
      }),
      remove: vi.fn<() => Promise<{ deleted: boolean; id: string }>>().mockResolvedValue({
        deleted: true,
        id: '1',
      }),
    } as unknown as TasksService;

    const controller = new TasksController(mockService);

    expect(await controller.findAll('todo')).toHaveLength(1);
    expect(findAll).toHaveBeenCalledWith('todo');

    expect(await controller.findOne('1')).toEqual({ id: '1', title: 'CI pipeline' });
    expect(await controller.create({ title: 'CI pipeline' })).toEqual({
      id: '1',
      title: 'CI pipeline',
    });
    expect(await controller.update('1', { status: 'done' })).toEqual({
      id: '1',
      status: 'done',
    });
    expect(await controller.remove('1')).toEqual({ deleted: true, id: '1' });
  });
});
