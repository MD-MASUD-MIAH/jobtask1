'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { Board, BoardMember } from '@/lib/types';
import { UserPlus, Trash2, Shield, User as UserIcon } from 'lucide-react';

interface ShareBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board | null;
  onMemberUpdated: (updatedBoard: Board) => void;
  currentUserId: string;
}

export const ShareBoardModal: React.FC<ShareBoardModalProps> = ({
  isOpen,
  onClose,
  board,
  onMemberUpdated,
  currentUserId,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!board) return null;

  const isOwner = board.ownerId === currentUserId;

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post<BoardMember>(`/boards/${board.id}/members`, {
        email: email.trim(),
      });

      const updatedMembers = [...board.members, res.data];
      const updatedBoard = { ...board, members: updatedMembers };
      onMemberUpdated(updatedBoard);

      setSuccess(`Added ${res.data.user.name} to the board`);
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userIdToRemove: string) => {
    try {
      await api.delete(`/boards/${board.id}/members/${userIdToRemove}`);
      const updatedMembers = board.members.filter((m) => m.userId !== userIdToRemove);
      onMemberUpdated({ ...board, members: updatedMembers });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share Board: ${board.title}`}>
      <div className="space-y-6 text-slate-100">
        {/* Invite Form */}
        {isOwner && (
          <form onSubmit={handleAddMember} className="space-y-3">
            <label className="block text-sm font-semibold text-slate-300">Invite Collaborator by Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-[6px] px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F99B4F] text-sm font-normal"
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="inline-flex items-center justify-center h-9 px-4 bg-[#E88A3E] hover:bg-[#d6792e] disabled:opacity-50 text-white font-medium text-sm rounded-[6px] transition-all space-x-1.5 flex-shrink-0"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-white" />
                    <span>Invite</span>
                  </>
                )}
              </button>
            </div>

            {error && <p className="text-red-300 font-medium text-xs mt-1 bg-red-950/60 border border-red-800 p-2 rounded-[6px]">{error}</p>}
            {success && <p className="text-emerald-300 font-medium text-xs mt-1 bg-emerald-950/60 border border-emerald-800 p-2 rounded-[6px]">{success}</p>}
          </form>
        )}

        {/* Existing Members List */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Board Members ({board.members.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {board.members.map((member) => {
              const memberIsOwner = member.role === 'OWNER' || member.userId === board.ownerId;
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-[6px]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#F99B4F] text-white flex items-center justify-center font-semibold text-xs">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <span>{member.user.name}</span>
                        {member.userId === currentUserId && (
                          <span className="text-[10px] bg-slate-800 text-[#F99B4F] px-2 py-0.5 rounded-full font-semibold border border-slate-700">You</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 font-normal">{member.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1 ${
                        memberIsOwner
                          ? 'bg-amber-950/40 text-[#F99B4F] border-amber-800/60'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {memberIsOwner && <Shield className="w-3 h-3 text-[#F99B4F]" />}
                      {memberIsOwner ? 'Owner' : 'Collaborator'}
                    </span>

                    {isOwner && !memberIsOwner && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.userId)}
                        className="text-slate-400 hover:text-red-400 hover:bg-red-950/40 p-1.5 rounded-[6px] transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
