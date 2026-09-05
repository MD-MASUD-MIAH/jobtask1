import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Column ID is required' })
  columnId: string;

  @IsString()
  @IsNotEmpty({ message: 'Task title is required' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  assignedToId?: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  assignedToId?: string | null;

  @IsString()
  @IsOptional()
  columnId?: string;
}

export class MoveTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Target Column ID is required' })
  targetColumnId: string;

  @IsNumber({}, { message: 'New position index must be a number' })
  newPositionIndex: number;
}
