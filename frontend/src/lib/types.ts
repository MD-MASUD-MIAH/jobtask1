export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: 'OWNER' | 'COLLABORATOR';
  createdAt: string;
  user: User;
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  assignedToId?: string | null;
  assignedTo?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  description?: string | null;
  ownerId: string;
  owner: User;
  members: BoardMember[];
  columns: Column[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    columns: number;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
