import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto/task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async createTask(dto: CreateTaskDto) {
    const column = await this.prisma.column.findUnique({
      where: { id: dto.columnId },
    });

    if (!column) {
      throw new NotFoundException('Target column not found');
    }

    const lastTask = await this.prisma.task.findFirst({
      where: { columnId: dto.columnId },
      orderBy: { orderIndex: 'desc' },
    });

    const orderIndex = lastTask ? lastTask.orderIndex + 1000 : 1000;

    return this.prisma.task.create({
      data: {
        columnId: dto.columnId,
        title: dto.title,
        description: dto.description,
        orderIndex,
        assignedToId: dto.assignedToId || null,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async updateTask(taskId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.assignedToId !== undefined && { assignedToId: dto.assignedToId }),
        ...(dto.columnId && { columnId: dto.columnId }),
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async deleteTask(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.delete({
      where: { id: taskId },
    });

    return { message: 'Task deleted successfully' };
  }

  async moveTask(taskId: string, dto: MoveTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const targetColumn = await this.prisma.column.findUnique({
      where: { id: dto.targetColumnId },
    });

    if (!targetColumn) {
      throw new NotFoundException('Target column not found');
    }

    // Get all tasks in target column except moving task
    const targetTasks = await this.prisma.task.findMany({
      where: {
        columnId: dto.targetColumnId,
        id: { not: taskId },
      },
      orderBy: { orderIndex: 'asc' },
    });

    const targetIdx = Math.max(0, Math.min(dto.newPositionIndex, targetTasks.length));

    let newOrderIndex: number;

    if (targetTasks.length === 0) {
      newOrderIndex = 1000;
    } else if (targetIdx === 0) {
      newOrderIndex = targetTasks[0].orderIndex / 2;
    } else if (targetIdx === targetTasks.length) {
      newOrderIndex = targetTasks[targetTasks.length - 1].orderIndex + 1000;
    } else {
      const prevOrder = targetTasks[targetIdx - 1].orderIndex;
      const nextOrder = targetTasks[targetIdx].orderIndex;
      newOrderIndex = (prevOrder + nextOrder) / 2;

      // Rebalance if precision threshold is breached (< 0.0001 gap)
      if (Math.abs(nextOrder - prevOrder) < 0.0001) {
        return this.rebalanceAndMoveTask(
          taskId,
          dto.targetColumnId,
          targetIdx,
          targetTasks,
        );
      }
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: dto.targetColumnId,
        orderIndex: newOrderIndex,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
  }

  private async rebalanceAndMoveTask(
    taskId: string,
    targetColumnId: string,
    targetIdx: number,
    existingTasks: any[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      const reorderedList = [...existingTasks];
      const taskToMove = await tx.task.findUnique({ where: { id: taskId } });
      if (!taskToMove) throw new NotFoundException('Task not found');

      reorderedList.splice(targetIdx, 0, taskToMove);

      for (let i = 0; i < reorderedList.length; i++) {
        await tx.task.update({
          where: { id: reorderedList[i].id },
          data: {
            columnId: targetColumnId,
            orderIndex: (i + 1) * 1000,
          },
        });
      }

      return tx.task.findUnique({
        where: { id: taskId },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
        },
      });
    });
  }
}
