import { NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/jwt';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    await ensureDb();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { boardId, title } = await req.json();
    if (!boardId || !title) {
      return NextResponse.json({ message: 'boardId and title are required' }, { status: 400 });
    }

    const lastColumn = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { orderIndex: 'desc' },
    });

    const newOrderIndex = lastColumn ? lastColumn.orderIndex + 1000 : 1000;

    const column = await prisma.column.create({
      data: {
        id: uuidv4(),
        boardId,
        title,
        orderIndex: newOrderIndex,
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

    return NextResponse.json(column, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
