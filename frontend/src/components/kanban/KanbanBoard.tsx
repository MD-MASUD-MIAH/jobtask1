'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Board, Column, Task } from '@/lib/types';
import { ColumnComponent } from './ColumnComponent';
import { TaskModal } from './TaskModal';
import { CreateColumnModal } from './CreateColumnModal';
import { api } from '@/lib/api';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  initialBoard: Board;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ initialBoard }) => {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [activeTaskModal, setActiveTaskModal] = useState<{
    isOpen: boolean;
    task: Task | null;
    columnId: string;
  }>({
    isOpen: false,
    task: null,
    columnId: '',
  });

  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  useEffect(() => {
    setBoard(initialBoard);
  }, [initialBoard]);

  // Drag and Drop Handler with Optimistic UI updates & Auto Rollback
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid drop target
    if (!destination) return;

    // Dropped in exact same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Preserve snapshot of previous board state for rollback
    const previousBoard = JSON.parse(JSON.stringify(board));

    // Construct optimistic board state
    const newColumns = board.columns.map((col) => ({
      ...col,
      tasks: [...col.tasks],
    }));

    const sourceCol = newColumns.find((c) => c.id === source.droppableId);
    const destCol = newColumns.find((c) => c.id === destination.droppableId);

    if (!sourceCol || !destCol) return;

    // Find and remove task from source column
    const [movedTask] = sourceCol.tasks.splice(source.index, 1);
    if (!movedTask) return;

    // Update columnId of task
    const updatedMovedTask = { ...movedTask, columnId: destination.droppableId };

    // Insert task into destination column
    destCol.tasks.splice(destination.index, 0, updatedMovedTask);

    // Update optimistic state
    setBoard({
      ...board,
      columns: newColumns,
    });

    // Fire API sync in background
    try {
      await api.patch(`/tasks/${draggableId}/move`, {
        targetColumnId: destination.droppableId,
        newPositionIndex: destination.index,
      });
    } catch (err: any) {
      console.error('Failed to sync task move on server, rolling back state:', err);
      // Gracefully rollback to snapshot
      setBoard(previousBoard);
      alert(err.response?.data?.message || 'Network sync failed. Reverting task position.');
    }
  };

  // Task CRUD operations
  const handleSaveTask = async (
    taskData: Partial<Task> & { columnId: string; title: string },
  ) => {
    if (taskData.id) {
      // Update Task
      const res = await api.put<Task>(`/tasks/${taskData.id}`, {
        title: taskData.title,
        description: taskData.description,
        assignedToId: taskData.assignedToId,
      });

      const updatedTask = res.data;
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
        })),
      }));
    } else {
      // Create Task
      const res = await api.post<Task>('/tasks', {
        columnId: taskData.columnId,
        title: taskData.title,
        description: taskData.description,
        assignedToId: taskData.assignedToId,
      });

      const newTask = res.data;
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) =>
          col.id === taskData.columnId
            ? { ...col, tasks: [...col.tasks, newTask] }
            : col,
        ),
      }));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await api.delete(`/tasks/${taskId}`);
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) => t.id !== taskId),
      })),
    }));
  };

  // Column CRUD operations
  const handleCreateColumn = async (title: string) => {
    const res = await api.post<Column>('/columns', {
      boardId: board.id,
      title,
    });
    const newColumn = res.data;
    setBoard((prev) => ({
      ...prev,
      columns: [...prev.columns, newColumn],
    }));
  };

  const handleUpdateColumnTitle = async (columnId: string, title: string) => {
    const res = await api.put<Column>(`/columns/${columnId}`, { title });
    const updatedColumn = res.data;
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId ? { ...col, title: updatedColumn.title } : col,
      ),
    }));
  };

  const handleDeleteColumn = async (columnId: string) => {
    await api.delete(`/columns/${columnId}`);
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.filter((col) => col.id !== columnId),
    }));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 flex gap-6 overflow-x-auto p-6 items-start">
          {board.columns.map((column) => (
            <ColumnComponent
              key={column.id}
              column={column}
              onAddTask={(colId) =>
                setActiveTaskModal({ isOpen: true, task: null, columnId: colId })
              }
              onEditTask={(task) =>
                setActiveTaskModal({ isOpen: true, task, columnId: task.columnId })
              }
              onUpdateColumnTitle={handleUpdateColumnTitle}
              onDeleteColumn={handleDeleteColumn}
            />
          ))}

          {/* Add Column Button */}
          <button
            onClick={() => setIsColumnModalOpen(true)}
            className="w-80 flex-shrink-0 bg-slate-900/60 hover:bg-slate-900 border border-dashed border-slate-800 hover:border-slate-700 rounded-[6px] p-4 text-slate-300 hover:text-[#F99B4F] transition-all flex items-center justify-center space-x-2 font-semibold text-sm h-14"
          >
            <Plus className="w-4.5 h-4.5 text-[#F99B4F]" />
            <span>Add Column</span>
          </button>
        </div>
      </DragDropContext>

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={activeTaskModal.isOpen}
        onClose={() =>
          setActiveTaskModal({ isOpen: false, task: null, columnId: '' })
        }
        task={activeTaskModal.task}
        columnId={activeTaskModal.columnId}
        boardMembers={board.members || []}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Create Column Modal */}
      <CreateColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        onCreateColumn={handleCreateColumn}
      />
    </div>
  );
};
