# Execution Roadmap: Mini Kanban Board Monorepo Application

## Technical Stack & Architecture
- **Architecture**: Monorepo with `/frontend` (Next.js App Router), `/backend` (NestJS + TypeScript with Clean Controller-Service-Repository Architecture), and root orchestration via Docker Compose.
- **Database & ORM**: PostgreSQL 15+ with Prisma ORM.
- **Authentication**: JWT authentication with `bcryptjs` password hashing and NestJS Guards.
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, and `@hello-pangea/dnd` for fluid drag-and-drop experience.

---

## Phase 1: Project Architecture & Environment Setup
- [x] Create root `PLAN.md` roadmap.
- [x] Initialize monorepo structure (`/backend`, `/frontend`).
- [x] Setup root `docker-compose.yml` with PostgreSQL 15, backend, and frontend services.
- [x] Setup `.env.example` and local `.env` configuration.

## Phase 2: Database Schema & Prisma Configuration (`/backend/prisma/schema.prisma`)
- [x] Define `User` model (id, email, passwordHash, name, timestamps).
- [x] Define `Board` model (id, title, description, ownerId, relation to User & Columns & Members).
- [x] Define `BoardMember` model (boardId, userId, role ENUM [OWNER, COLLABORATOR], unique `[boardId, userId]`).
- [x] Define `Column` model (id, boardId, title, orderIndex Float, relation to Board & Tasks).
- [x] Define `Task` model (id, columnId, title, description, orderIndex Float, assignedToId optional relation to User).
- [x] Seed script for initial test user, board, columns, and tasks.

## Phase 3: Backend Implementation (`/backend`)
- [x] **Core Setup**: NestJS + TypeScript app initialization, error handling filter, DTO validation with `class-validator` & `class-transformer`.
- [x] **Auth Module**: Sign-up, sign-in, JWT token generation, `JwtAuthGuard` to verify Bearer tokens and inject `req.user`.
- [x] **Board Access Control Guard**: `BoardAccessGuard` verifying user ownership or collaborator status for board operations, preventing cross-board data leaks.
- [x] **Board Module**: CRUD endpoints for boards (`GET /api/boards`, `POST /api/boards`, `GET /api/boards/:id`, `PUT /api/boards/:id`, `DELETE /api/boards/:id`) and member management (`POST /api/boards/:id/members`, `DELETE /api/boards/:id/members/:userId`).
- [x] **Column Module**: CRUD endpoints for board columns (`POST /api/columns`, `PUT /api/columns/:id`, `DELETE /api/columns/:id`, `PATCH /api/columns/:id/move`).
- [x] **Task Module**: CRUD endpoints for tasks (`POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`).
- [x] **Task Reordering API (`PATCH /api/tasks/:id/move`)**:
  - Accept `{ targetColumnId, newPositionIndex }`.
  - Implement fractional indexing for Float `orderIndex` with automatic re-normalization on collision to ensure stable, conflict-free reordering.

## Phase 4: Frontend Implementation (`/frontend`)
- [x] **Setup**: Next.js App Router with Tailwind CSS, Lucide React icons, and `@hello-pangea/dnd`.
- [x] **Auth UI & Context**: `AuthContext` for session management, Login page, Register page, JWT persistence, protected route wrappers.
- [x] **Dashboard View**: Grid display of owned and shared boards, Create Board modal, Invite Collaborators modal, quick search/filter.
- [x] **Interactive Kanban Board View**:
  - Drag-and-drop column layout for To Do, In Progress, Done, and custom columns.
  - `@hello-pangea/dnd` integration with custom drag handles, visual indicators, smooth animations.
  - Optimistic state updates on drag drop with auto-rollback on API failure.
  - Task management modals: Create Task, Edit Task details, assign board members, Delete Task.
  - Column management: Add Column, Edit Column title, Delete Column.
- [x] **Design & Polish**: Modern dark/light sleek dashboard UI with subtle micro-interactions, loading skeletons, responsive layout.

## Phase 5: Infrastructure, Docker & Documentation
- [x] Multi-stage Dockerfiles for `/backend` and `/frontend`.
- [x] Production-ready `docker-compose.yml` with healthchecks, persistent volumes, environment bindings.
- [x] Exhaustive `README.md` with architectural diagrams, manual & Docker setup guides, migration instructions, and API contract specifications.

