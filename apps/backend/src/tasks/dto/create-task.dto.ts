import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import type { TaskPriority } from '../task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsIn(['low', 'medium', 'high'])
  @IsOptional()
  priority?: TaskPriority;
}
