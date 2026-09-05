'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Board } from '@/lib/types';
import { Navbar } from '@/components/common/Navbar';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ShareBoardModal } from '@/components/dashboard/ShareBoardModal';
import { ArrowLeft, Users, AlertCircle, Shield } from 'lucide-react';
import Link from 'next/link';

export default function BoardDetailPage() {
  const { id } = useParams() as { id: string };
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const fetchBoard = async () => {
    try {
      setLoading(true);
      const res = await api.get<Board>(`/boards/${id}`);
      setBoard(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (id) {
        fetchBoard();
      }
    }
  }, [user, authLoading, id, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-800 border-t-[#F99B4F] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[6px] shadow-2xl max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Access Restricted or Board Not Found</h2>
            <p className="text-slate-400 text-sm mb-6 font-normal">{error || 'Unable to access board details.'}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 bg-[#F99B4F] hover:bg-[#e88a3e] text-white text-sm font-semibold px-4 py-2.5 rounded-[6px] transition-all border border-amber-600/30"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = board.ownerId === user?.id;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col h-screen overflow-hidden">
      <Navbar />

      {/* Sub-Header / Board Bar */}
      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-[6px] border border-slate-700 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg font-semibold text-white tracking-tight">{board.title}</h1>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                  isOwner
                    ? 'bg-amber-950/40 text-[#F99B4F] border-amber-800/60'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {isOwner ? 'Owner' : 'Collaborator'}
              </span>
            </div>
            {board.description && (
              <p className="text-xs text-slate-400 truncate max-w-xl font-normal mt-0.5">{board.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Member Avatars */}
          <div className="hidden sm:flex items-center -space-x-2 overflow-hidden">
            {board.members.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 bg-[#F99B4F] text-white flex items-center justify-center font-semibold text-xs"
                title={`${m.user.name} (${m.role})`}
              >
                {m.user.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {board.members.length > 4 && (
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 bg-slate-800 text-slate-300 flex items-center justify-center font-semibold text-xs">
                +{board.members.length - 4}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-semibold px-3.5 py-2 rounded-[6px] transition-all flex items-center space-x-2 shadow-xs"
          >
            <Users className="w-4 h-4 text-[#F99B4F]" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Kanban Board Canvas */}
      <KanbanBoard initialBoard={board} />

      {/* Share Modal */}
      <ShareBoardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        board={board}
        onMemberUpdated={(updatedBoard) => setBoard(updatedBoard)}
        currentUserId={user?.id || ''}
      />
    </div>
  );
}
