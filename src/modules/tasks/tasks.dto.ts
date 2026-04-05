import { IsBoolean, IsEnum, IsISO8601, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TaskPriority } from './domain/task.types';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsISO8601()
  dueDate?: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  priority!: TaskPriority;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  relatedTo?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsISO8601()
  dueDate?: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  priority?: TaskPriority;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  relatedTo?: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;
}
