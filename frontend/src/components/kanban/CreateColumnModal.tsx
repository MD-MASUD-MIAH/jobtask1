'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Plus } from 'lucide-react';

interface CreateColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateColumn: (title: string) => Promise<void>;
}

export const CreateColumnModal: React.FC<CreateColumnModalProps> = ({
  isOpen,
  onClose,
  onCreateColumn,
}) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');

    try {
      await onCreateColumn(title.trim());
      setTitle('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create column');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Column">
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-100">
        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 p-3 rounded-[6px] text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">Column Name *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Backlog, Testing, In Review"
            className="w-full bg-slate-950 border border-slate-800 rounded-[6px] px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F99B4F] font-normal transition-all"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
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
                <Plus className="w-4 h-4 text-white" />
                <span>Add Column</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
