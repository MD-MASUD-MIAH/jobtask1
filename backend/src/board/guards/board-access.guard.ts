import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BoardAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    const params = request.params;
    const body = request.body;

    let boardId: string | null = null;

    if (params.boardId) {
      boardId = params.boardId;
    } else if (params.id && request.baseUrl.includes('/boards')) {
      boardId = params.id;
    } else if (params.id && request.baseUrl.includes('/columns')) {
      const column = await this.prisma.column.findUnique({
        where: { id: params.id },
        select: { boardId: true },
      });
      if (!column) {
        throw new NotFoundException('Column not found');
      }
      boardId = column.boardId;
    } else if (params.id && request.baseUrl.includes('/tasks')) {
      const task = await this.prisma.task.findUnique({
        where: { id: params.id },
        select: { column: { select: { boardId: true } } },
      });
      if (!task) {
        throw new NotFoundException('Task not found');
      }
      boardId = task.column.boardId;
    } else if (body && body.boardId) {
      boardId = body.boardId;
    } else if (body && body.columnId) {
      const column = await this.prisma.column.findUnique({
        where: { id: body.columnId },
        select: { boardId: true },
      });
      if (!column) {
        throw new NotFoundException('Target column not found');
      }
      boardId = column.boardId;
    }

    if (!boardId) {
      return true; // No board context to guard
    }

    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          where: { userId: user.id },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const isOwner = board.ownerId === user.id;
    const isMember = board.members.length > 0;

    if (!isOwner && !isMember) {
      throw new ForbiddenException('You do not have access to this board');
    }

    request.board = board;
    return true;
  }
}
