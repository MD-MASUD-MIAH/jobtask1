'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Task, BoardMember } from '@/lib/types';
import { Save, Trash2, User as UserIcon } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null; // Null if creating
  columnId: string;
  boardMembers: BoardMember[];
  onSaveTask: (taskData: Partial<Task> & { columnId: string; title: string }) => Promise<void>;
  onDeleteTask?: (taskId: string) => Promise<void>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  columnId,
  boardMembers,
  onSaveTask,
  onDeleteTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setAssignedToId(task.assignedToId || undefined);
    } else {
      setTitle('');
      setDescription('');
      setAssignedToId(undefined);
    }
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');

    try {
      await onSaveTask({
        id: task?.id,
        columnId: task?.columnId || columnId,
        title: title.trim(),
        description: description.trim() || undefined,
        assignedToId: assignedToId || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !onDeleteTask) return;
    if (!confirm('Are you sure you want to delete this task?')) return;

    setLoading(true);
    try {
      await onDeleteTask(task.id);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task Details' : 'Create New Task'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-900">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Task Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement OAuth logic"
            className="w-full bg-slate-950 border border-slate-800 rounded-[6px] px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F99B4F] font-normal transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context or acceptance criteria for this task..."
            className="w-full bg-slate-950 border border-slate-800 rounded-[6px] px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F99B4F] font-normal transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Assignee</label>
          <select
            value={assignedToId || ''}
            onChange={(e) => setAssignedToId(e.target.value || undefined)}
            className="w-full bg-slate-950 border border-slate-800 rounded-[6px] px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#F99B4F] font-normal transition-all"
          >
            <option value="">Unassigned</option>
            {boardMembers.map((m) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.name} ({m.user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {task && onDeleteTask ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="text-red-400 hover:bg-red-950/40 p-2 rounded-[6px] transition-colors flex items-center space-x-1.5 text-sm font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-[6px] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="inline-flex items-center justify-center h-9 px-4 bg-[#E88A3E] hover:bg-[#d6792e] disabled:opacity-50 text-white font-medium text-sm rounded-[6px] transition-all space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>{task ? 'Save Changes' : 'Create Task'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
