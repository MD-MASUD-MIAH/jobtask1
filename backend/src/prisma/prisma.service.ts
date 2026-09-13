import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const dbUrl = process.env.DATABASE_URL;

    if (isVercel && (!dbUrl || dbUrl.startsWith('file:'))) {
      const targetDbPath = '/tmp/dev.db';
      try {
        if (!fs.existsSync(targetDbPath)) {
          const possibleSeedPaths = [
            path.join(process.cwd(), 'prisma', 'dev.db'),
            path.join(process.cwd(), 'backend', 'prisma', 'dev.db'),
            path.join(process.cwd(), 'dev.db'),
            path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
          ];
          let copied = false;
          for (const seedPath of possibleSeedPaths) {
            if (fs.existsSync(seedPath)) {
              fs.copyFileSync(seedPath, targetDbPath);
              copied = true;
              break;
            }
          }
          if (!copied) {
            fs.writeFileSync(targetDbPath, '');
          }
        }
      } catch (err) {
        console.error('Error preparing SQLite db in /tmp:', err);
      }

      super({
        datasources: {
          db: {
            url: `file:${targetDbPath}`,
          },
        },
      });
    } else {
      super();
    }
  }

  async onModuleInit() {
    await this.$connect();
    const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const dbUrl = process.env.DATABASE_URL;
    if (isVercel && (!dbUrl || dbUrl.startsWith('file:'))) {
      await this.ensureTables();
    }
  }

  private async ensureTables() {
    try {
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          passwordHash TEXT NOT NULL,
          name TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await this.$executeRawUnsafe(`
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
      await this.$executeRawUnsafe(`
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
      await this.$executeRawUnsafe(`
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
      await this.$executeRawUnsafe(`
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
    } catch (err) {
      console.error('Error auto-creating SQLite tables on Vercel:', err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

