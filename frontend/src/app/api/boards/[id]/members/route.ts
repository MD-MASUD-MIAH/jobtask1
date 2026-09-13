import { NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/jwt';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await ensureDb();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!targetUser) {
      return NextResponse.json({ message: 'User with specified email not found' }, { status: 404 });
    }

    const existing = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: params.id,
          userId: targetUser.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'User is already a member of this board' }, { status: 409 });
    }

    const member = await prisma.boardMember.create({
      data: {
        id: uuidv4(),
        boardId: params.id,
        userId: targetUser.id,
        role: 'COLLABORATOR',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
