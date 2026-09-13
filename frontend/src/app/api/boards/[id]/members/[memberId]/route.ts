import { NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/jwt';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; memberId: string } },
) {
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

    if (board.ownerId === params.memberId) {
      return NextResponse.json({ message: 'Cannot remove the board owner' }, { status: 403 });
    }

    if (board.ownerId !== userId && params.memberId !== userId) {
      return NextResponse.json({ message: 'Only owner can remove collaborators' }, { status: 403 });
    }

    await prisma.boardMember.delete({
      where: {
        boardId_userId: {
          boardId: params.id,
          userId: params.memberId,
        },
      },
    });

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
