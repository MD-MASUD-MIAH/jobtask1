import { NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    await ensureDb();
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
