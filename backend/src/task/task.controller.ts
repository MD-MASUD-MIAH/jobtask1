import {
  Controller,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BoardAccessGuard } from '../board/guards/board-access.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  @UseGuards(BoardAccessGuard)
  createTask(@Body() dto: CreateTaskDto) {
    return this.taskService.createTask(dto);
  }

  @Put(':id')
  @UseGuards(BoardAccessGuard)
  updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.taskService.updateTask(id, dto);
  }

  @Delete(':id')
  @UseGuards(BoardAccessGuard)
  deleteTask(@Param('id') id: string) {
    return this.taskService.deleteTask(id);
  }

  @Patch(':id/move')
  @UseGuards(BoardAccessGuard)
  moveTask(@Param('id') id: string, @Body() dto: MoveTaskDto) {
    return this.taskService.moveTask(id, dto);
  }
}
