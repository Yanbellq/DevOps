import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { TasksService } from './tasks.service';

import type { Task } from './task.entity';
import type { Repository } from 'typeorm';

function createMockRepository() {
  return {
    find: vi.fn<() => Promise<Task[]>>(),
    findOne: vi.fn<() => Promise<Task | null>>(),
    create: vi.fn<(data: Partial<Task>) => Task>((data: Partial<Task>) => ({
      id: 'task-1',
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    })),
    save: vi.fn<(task: Task) => Promise<Task>>((task: Task) => Promise.resolve(task)),
    remove: vi.fn<(task: Task) => Promise<Task>>((task: Task) => Promise.resolve(task)),
  };
}

describe('TasksService', () => {
  let service: TasksService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    repo = createMockRepository();
    service = new TasksService(repo as unknown as Repository<Task>);
  });

  it('creates a task with trimmed title and default status', async () => {
    const result = await service.create({
      title: '  Configure Docker  ',
      description: '  Add multi-stage Dockerfile  ',
      priority: 'high',
    });

    expect(repo.create).toHaveBeenCalledWith({
      title: 'Configure Docker',
      description: 'Add multi-stage Dockerfile',
      priority: 'high',
      status: 'todo',
    });
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result.title).toBe('Configure Docker');
    expect(result.status).toBe('todo');
  });

  it('lists tasks optionally filtered by status', async () => {
    const sample = [{ id: '1', title: 'Test', status: 'done' }] as Task[];
    repo.find.mockResolvedValue(sample);

    const all = await service.findAll();
    expect(repo.find).toHaveBeenCalledWith({
      where: undefined,
      order: { createdAt: 'DESC' },
    });
    expect(all).toEqual(sample);

    await service.findAll('done');
    expect(repo.find).toHaveBeenCalledWith({
      where: { status: 'done' },
      order: { createdAt: 'DESC' },
    });
  });

  it('throws NotFoundException when task does not exist', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates an existing task', async () => {
    const existing = {
      id: 'task-1',
      title: 'Old',
      description: '',
      status: 'todo',
      priority: 'medium',
    } as Task;
    repo.findOne.mockResolvedValue(existing);

    const updated = await service.update('task-1', { status: 'done', title: ' New ' });
    expect(updated.status).toBe('done');
    expect(updated.title).toBe('New');
    expect(repo.save).toHaveBeenCalledWith(existing);
  });

  it('removes an existing task', async () => {
    const existing = { id: 'task-1', title: 'Delete me' } as Task;
    repo.findOne.mockResolvedValue(existing);

    const res = await service.remove('task-1');
    expect(repo.remove).toHaveBeenCalledWith(existing);
    expect(res).toEqual({ deleted: true, id: 'task-1' });
  });
});
