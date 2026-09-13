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

    const { columnId, title, description, assignedToId } = await req.json();
    if (!columnId || !title) {
      return NextResponse.json({ message: 'columnId and title are required' }, { status: 400 });
    }

    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { orderIndex: 'desc' },
    });

    const newOrderIndex = lastTask ? lastTask.orderIndex + 1000 : 1000;

    const task = await prisma.task.create({
      data: {
        id: uuidv4(),
        columnId,
        title,
        description,
        orderIndex: newOrderIndex,
        assignedToId,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
