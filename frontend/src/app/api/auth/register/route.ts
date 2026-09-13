import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma, ensureDb } from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    await ensureDb();
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ message: 'A user with this email already exists' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const id = uuidv4();

    const user = await prisma.user.create({
      data: { id, email: cleanEmail, passwordHash, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const accessToken = signToken({ sub: user.id, email: user.email });
    return NextResponse.json({ user, accessToken });
  } catch (error: any) {
    console.error('Register API Error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
