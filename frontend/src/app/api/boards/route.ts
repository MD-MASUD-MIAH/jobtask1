import { NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/jwt';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    await ensureDb();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const ownedBoards = await prisma.board.findMany({
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

    const sharedBoards = await prisma.board.findMany({
      where: {
        members: {
          some: { userId },
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

    return NextResponse.json({ ownedBoards, sharedBoards });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDb();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { title, description } = await req.json();
    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    const boardId = uuidv4();
    const board = await prisma.board.create({
      data: {
        id: boardId,
        title,
        description,
        ownerId: userId,
        members: {
          create: {
            id: uuidv4(),
            userId,
            role: 'OWNER',
          },
        },
      },
    });

    const defaultColumns = ['To Do', 'In Progress', 'Done'];
    for (let i = 0; i < defaultColumns.length; i++) {
      await prisma.column.create({
        data: {
          id: uuidv4(),
          boardId: board.id,
          title: defaultColumns[i],
          orderIndex: (i + 1) * 1000,
        },
      });
    }

    const fullBoard = await prisma.board.findUnique({
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

    return NextResponse.json(fullBoard, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
