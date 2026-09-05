import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto, UpdateColumnDto, MoveColumnDto } from './dto/column.dto';

@Injectable()
export class ColumnService {
  constructor(private prisma: PrismaService) {}

  async createColumn(dto: CreateColumnDto) {
    const lastColumn = await this.prisma.column.findFirst({
      where: { boardId: dto.boardId },
      orderBy: { orderIndex: 'desc' },
    });

    const orderIndex = lastColumn ? lastColumn.orderIndex + 1000 : 1000;

    return this.prisma.column.create({
      data: {
        boardId: dto.boardId,
        title: dto.title,
        orderIndex,
      },
      include: {
        tasks: {
          orderBy: { orderIndex: 'asc' },
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  }

  async updateColumn(columnId: string, dto: UpdateColumnDto) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    return this.prisma.column.update({
      where: { id: columnId },
      data: {
        ...(dto.title && { title: dto.title }),
      },
    });
  }

  async deleteColumn(columnId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    await this.prisma.column.delete({
      where: { id: columnId },
    });

    return { message: 'Column deleted successfully' };
  }

  async moveColumn(columnId: string, dto: MoveColumnDto) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const columns = await this.prisma.column.findMany({
      where: { boardId: column.boardId },
      orderBy: { orderIndex: 'asc' },
    });

    const otherColumns = columns.filter((c) => c.id !== columnId);
    const targetIdx = Math.max(0, Math.min(dto.newPositionIndex, otherColumns.length));

    let newOrderIndex: number;

    if (otherColumns.length === 0) {
      newOrderIndex = 1000;
    } else if (targetIdx === 0) {
      newOrderIndex = otherColumns[0].orderIndex / 2;
    } else if (targetIdx === otherColumns.length) {
      newOrderIndex = otherColumns[otherColumns.length - 1].orderIndex + 1000;
    } else {
      const prevOrder = otherColumns[targetIdx - 1].orderIndex;
      const nextOrder = otherColumns[targetIdx].orderIndex;
      newOrderIndex = (prevOrder + nextOrder) / 2;
    }

    return this.prisma.column.update({
      where: { id: columnId },
      data: { orderIndex: newOrderIndex },
    });
  }
}
