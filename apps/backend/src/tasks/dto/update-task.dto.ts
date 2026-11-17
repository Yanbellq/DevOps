import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import type { TaskPriority, TaskStatus } from '../task.entity';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsIn(['todo', 'in_progress', 'done'])
  @IsOptional()
  status?: TaskStatus;

  @IsIn(['low', 'medium', 'high'])
  @IsOptional()
  priority?: TaskPriority;
}
