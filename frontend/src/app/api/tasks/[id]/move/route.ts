import { NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/jwt';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await ensureDb();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { targetColumnId, newPositionIndex } = await req.json();

    const tasksInColumn = await prisma.task.findMany({
      where: { columnId: targetColumnId },
      orderBy: { orderIndex: 'asc' },
    });

    // Remove moving task if it's already in the same column
    const filteredTasks = tasksInColumn.filter((t) => t.id !== params.id);
    const targetIdx = Math.max(0, Math.min(newPositionIndex, filteredTasks.length));

    let prevOrder = targetIdx > 0 ? filteredTasks[targetIdx - 1].orderIndex : 0;
    let nextOrder = targetIdx < filteredTasks.length ? filteredTasks[targetIdx].orderIndex : prevOrder + 2000;

    let computedOrderIndex = (prevOrder + nextOrder) / 2;

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        columnId: targetColumnId,
        orderIndex: computedOrderIndex,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
