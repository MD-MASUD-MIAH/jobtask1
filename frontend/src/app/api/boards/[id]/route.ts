import { NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/jwt';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await ensureDb();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const board = await prisma.board.findUnique({
      where: { id: params.id },
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
      return NextResponse.json({ message: 'Board not found' }, { status: 404 });
    }

    const isMember = board.members.some((m) => m.userId === userId);
    if (!isMember && board.ownerId !== userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(board);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await ensureDb();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { title, description } = await req.json();
    const updated = await prisma.board.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await ensureDb();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const board = await prisma.board.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    });

    if (!board) {
      return NextResponse.json({ message: 'Board not found' }, { status: 404 });
    }

    if (board.ownerId !== userId) {
      return NextResponse.json({ message: 'Only owner can delete board' }, { status: 403 });
    }

    await prisma.board.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Board deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
