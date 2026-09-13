import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const isProd = process.env.NODE_ENV === 'production';
const rawPath = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace('file:', '')
  : isProd
    ? '/tmp/dev.db'
    : path.join(process.cwd(), 'prisma', 'dev.db');

// Ensure parent directory exists for SQLite file
try {
  const dir = path.dirname(rawPath);
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
} catch (e) {
  // Ignore in read-only environments
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: `file:${rawPath}`,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

let isDbInitialized = false;

export async function ensureDb() {
  if (isDbInitialized) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        name TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS boards (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        ownerId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS board_members (
        id TEXT PRIMARY KEY,
        boardId TEXT NOT NULL,
        userId TEXT NOT NULL,
        role TEXT DEFAULT 'COLLABORATOR',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (boardId) REFERENCES boards(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(boardId, userId)
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS columns (
        id TEXT PRIMARY KEY,
        boardId TEXT NOT NULL,
        title TEXT NOT NULL,
        orderIndex REAL NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (boardId) REFERENCES boards(id) ON DELETE CASCADE
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        columnId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        orderIndex REAL NOT NULL,
        assignedToId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (columnId) REFERENCES columns(id) ON DELETE CASCADE,
        FOREIGN KEY (assignedToId) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    isDbInitialized = true;
  } catch (e) {
    console.error('Error initializing database tables:', e);
  }
}
