import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto, UpdateBoardDto, AddBoardMemberDto } from './dto/board.dto';

@Injectable()
export class BoardService {
  constructor(private prisma: PrismaService) {}

  async getUserBoards(userId: string) {
    const ownedBoards = await this.prisma.board.findMany({
      where: { ownerId: userId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { select: { columns: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const sharedBoards = await this.prisma.board.findMany({
      where: {
        members: {
          some: { userId: userId },
        },
        ownerId: { not: userId },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: { select: { columns: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      ownedBoards,
      sharedBoards,
    };
  }

  async createBoard(userId: string, dto: CreateBoardDto) {
    return this.prisma.$transaction(async (tx) => {
      const board = await tx.board.create({
        data: {
          title: dto.title,
          description: dto.description,
          ownerId: userId,
          members: {
            create: {
              userId,
              role: 'OWNER',
            },
          },
        },
      });

      // Create standard default columns
      const defaultColumns = ['To Do', 'In Progress', 'Done'];
      for (let i = 0; i < defaultColumns.length; i++) {
        await tx.column.create({
          data: {
            boardId: board.id,
            title: defaultColumns[i],
            orderIndex: (i + 1) * 1000,
          },
        });
      }

      return tx.board.findUnique({
        where: { id: board.id },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          columns: {
            orderBy: { orderIndex: 'asc' },
            include: {
              tasks: {
                orderBy: { orderIndex: 'asc' },
                include: {
                  assignedTo: { select: { id: true, name: true, email: true } },
                },
              },
            },
          },
        },
      });
    });
  }

  async getBoardById(boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        columns: {
          orderBy: { orderIndex: 'asc' },
          include: {
            tasks: {
              orderBy: { orderIndex: 'asc' },
              include: {
                assignedTo: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  async updateBoard(boardId: string, dto: UpdateBoardDto) {
    return this.prisma.board.update({
      where: { id: boardId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  async deleteBoard(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { ownerId: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.ownerId !== userId) {
      throw new ForbiddenException('Only the board owner can delete this board');
    }

    await this.prisma.board.delete({
      where: { id: boardId },
    });

    return { message: 'Board deleted successfully' };
  }

  async addMember(boardId: string, dto: AddBoardMemberDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('User with specified email not found');
    }

    const existingMember = await this.prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this board');
    }

    const member = await this.prisma.boardMember.create({
      data: {
        boardId,
        userId: user.id,
        role: 'COLLABORATOR',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return member;
  }

  async removeMember(boardId: string, memberUserId: string, requestingUserId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { ownerId: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.ownerId === memberUserId) {
      throw new ForbiddenException('Cannot remove the board owner from members');
    }

    if (board.ownerId !== requestingUserId && memberUserId !== requestingUserId) {
      throw new ForbiddenException('Only board owner can remove collaborators');
    }

    await this.prisma.boardMember.delete({
      where: {
        boardId_userId: {
          boardId,
          userId: memberUserId,
        },
      },
    });

    return { message: 'Member removed successfully' };
  }
}
