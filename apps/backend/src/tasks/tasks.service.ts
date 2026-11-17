import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Task, type TaskStatus } from './task.entity';

import type { CreateTaskDto } from './dto/create-task.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';
import type { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  findAll(status?: TaskStatus): Promise<Task[]> {
    return this.taskRepository.find({
      where: status ? { status } : undefined,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  create(dto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create({
      title: dto.title.trim(),
      description: dto.description?.trim() ?? '',
      priority: dto.priority ?? 'medium',
      status: 'todo',
    });
    return this.taskRepository.save(task);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    if (dto.title !== undefined) task.title = dto.title.trim();
    if (dto.description !== undefined) task.description = dto.description.trim();
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.priority !== undefined) task.priority = dto.priority;
    return this.taskRepository.save(task);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
    return { deleted: true, id };
  }
}
