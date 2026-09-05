'use client';

import React from 'react';
import Link from 'next/link';
import { Board } from '@/lib/types';
import { Kanban, Users, ArrowRight, Trash2, UserCheck } from 'lucide-react';

interface BoardCardProps {
  board: Board;
  currentUserId: string;
  onShare: (board: Board) => void;
  onDelete: (boardId: string) => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({
  board,
  currentUserId,
  onShare,
  onDelete,
}) => {
  const isOwner = board.ownerId === currentUserId;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[6px] p-6 flex flex-col justify-between text-slate-100 shadow-sm hover:border-slate-700 transition-all group">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="bg-slate-800 text-[#F99B4F] p-2.5 rounded-[6px] border border-slate-700">
            <Kanban className="w-5 h-5" />
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                isOwner
                  ? 'bg-amber-950/40 text-[#F99B4F] border-amber-800/60'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {isOwner ? 'Owner' : 'Collaborator'}
            </span>

            {isOwner && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(board.id);
                }}
                className="text-slate-400 hover:text-red-400 hover:bg-red-950/40 p-1.5 rounded-[6px] transition-colors"
                title="Delete Board"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-base font-semibold text-white mb-2 group-hover:text-[#F99B4F] transition-colors">
          {board.title}
        </h3>

        <p className="text-slate-400 text-sm line-clamp-2 mb-6 font-normal">
          {board.description || 'No description provided.'}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400 font-medium">
          <button
            onClick={() => onShare(board)}
            className="flex items-center space-x-1.5 hover:text-white transition-colors"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>{board.members?.length || 1} Members</span>
          </button>

          <Link
            href={`/board/${board.id}`}
            className="inline-flex items-center justify-center h-8 px-3 bg-[#E88A3E] hover:bg-[#d6792e] text-white text-xs font-medium rounded-[6px] transition-all space-x-1.5"
          >
            <span>Open Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
