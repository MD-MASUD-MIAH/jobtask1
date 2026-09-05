import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.task.deleteMany({});
  await prisma.column.deleteMany({});
  await prisma.boardMember.deleteMany({});
  await prisma.board.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed Users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  const john = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      passwordHash,
    },
  });

  const jane = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      passwordHash,
    },
  });

  console.log('Created users:', { john: john.email, jane: jane.email });

  // Seed Board
  const board = await prisma.board.create({
    data: {
      title: 'Product Roadmap Q3',
      description: 'Sprint planning & feature tracking board',
      ownerId: john.id,
      members: {
        create: [
          { userId: john.id, role: 'OWNER' },
          { userId: jane.id, role: 'COLLABORATOR' },
        ],
      },
    },
  });

  console.log('Created board:', board.title);

  // Seed Columns
  const todoCol = await prisma.column.create({
    data: {
      boardId: board.id,
      title: 'To Do',
      orderIndex: 1000,
    },
  });

  const inProgressCol = await prisma.column.create({
    data: {
      boardId: board.id,
      title: 'In Progress',
      orderIndex: 2000,
    },
  });

  const doneCol = await prisma.column.create({
    data: {
      boardId: board.id,
      title: 'Done',
      orderIndex: 3000,
    },
  });

  // Seed Tasks
  await prisma.task.createMany({
    data: [
      {
        columnId: todoCol.id,
        title: 'Design Database Schema',
        description: 'Set up Prisma models for Users, Boards, Columns, and Tasks',
        orderIndex: 1000,
        assignedToId: john.id,
      },
      {
        columnId: todoCol.id,
        title: 'Implement JWT Guard',
        description: 'Secure API endpoints with Passport JWT strategy',
        orderIndex: 2000,
        assignedToId: jane.id,
      },
      {
        columnId: inProgressCol.id,
        title: 'Build Drag-and-Drop Board',
        description: 'Integrate @hello-pangea/dnd with optimistic UI updates',
        orderIndex: 1000,
        assignedToId: john.id,
      },
      {
        columnId: doneCol.id,
        title: 'Setup Monorepo Docker Orchestration',
        description: 'Configure multi-stage Dockerfiles and docker-compose.yml',
        orderIndex: 1000,
        assignedToId: jane.id,
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
