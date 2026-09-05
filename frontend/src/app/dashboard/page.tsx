'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Board } from '@/lib/types';
import { Navbar } from '@/components/common/Navbar';
import { BoardCard } from '@/components/dashboard/BoardCard';
import { CreateBoardModal } from '@/components/dashboard/CreateBoardModal';
import { ShareBoardModal } from '@/components/dashboard/ShareBoardModal';
import { Plus, LayoutGrid, Search, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [ownedBoards, setOwnedBoards] = useState<Board[]>([]);
  const [sharedBoards, setSharedBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [shareBoard, setShareBoard] = useState<Board | null>(null);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ ownedBoards: Board[]; sharedBoards: Board[] }>('/boards');
      setOwnedBoards(res.data.ownedBoards);
      setSharedBoards(res.data.sharedBoards);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch boards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchBoards();
      }
    }
  }, [user, authLoading, router]);

  const handleBoardCreated = (newBoard: Board) => {
    setOwnedBoards((prev) => [newBoard, ...prev]);
  };

  const handleBoardDeleted = async (boardId: string) => {
    if (!confirm('Are you sure you want to delete this board? All columns and tasks will be removed.')) {
      return;
    }
    try {
      await api.delete(`/boards/${boardId}`);
      setOwnedBoards((prev) => prev.filter((b) => b.id !== boardId));
      setSharedBoards((prev) => prev.filter((b) => b.id !== boardId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete board');
    }
  };

  const handleMemberUpdated = (updatedBoard: Board) => {
    setOwnedBoards((prev) => prev.map((b) => (b.id === updatedBoard.id ? updatedBoard : b)));
    setSharedBoards((prev) => prev.map((b) => (b.id === updatedBoard.id ? updatedBoard : b)));
    setShareBoard(updatedBoard);
  };

  const filterBoards = (boards: Board[]) => {
    if (!searchQuery.trim()) return boards;
    return boards.filter(
      (b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-slate-800 border-t-[#F99B4F] rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredOwned = filterBoards(ownedBoards);
  const filteredShared = filterBoards(sharedBoards);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
              <LayoutGrid className="w-7 h-7 text-[#F99B4F]" />
              <span>Workspace Dashboard</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-normal">Manage your active projects and collaborator boards</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search boards..."
                className="w-full bg-slate-900 border border-slate-800 rounded-[6px] pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F99B4F] font-normal transition-all"
              />
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center h-9 px-4 bg-[#E88A3E] hover:bg-[#d6792e] text-white font-medium text-sm rounded-[6px] transition-all space-x-2"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create Board</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 p-4 rounded-[6px] text-sm flex items-center space-x-2 mb-8 font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Owned Boards */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span>My Boards</span>
            <span className="text-xs bg-slate-800 text-[#F99B4F] border border-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
              {filteredOwned.length}
            </span>
          </h2>

          {filteredOwned.length === 0 ? (
            <div className="bg-slate-900 border border-dashed border-slate-800 rounded-[6px] p-12 text-center">
              <p className="text-slate-400 mb-4 font-normal">You haven&apos;t created any boards yet.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center space-x-2 bg-[#F99B4F] hover:bg-[#e88a3e] text-white text-sm font-semibold px-4 py-2.5 rounded-[6px] transition-all border border-amber-600/30"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Create Your First Board</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOwned.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  currentUserId={user!.id}
                  onShare={(b) => setShareBoard(b)}
                  onDelete={handleBoardDeleted}
                />
              ))}
            </div>
          )}
        </section>

        {/* Shared Boards */}
        {filteredShared.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span>Shared With Me</span>
              <span className="text-xs bg-slate-800 text-[#F99B4F] border border-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
                {filteredShared.length}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShared.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  currentUserId={user!.id}
                  onShare={(b) => setShareBoard(b)}
                  onDelete={handleBoardDeleted}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBoardCreated={handleBoardCreated}
      />

      <ShareBoardModal
        isOpen={!!shareBoard}
        onClose={() => setShareBoard(null)}
        board={shareBoard}
        onMemberUpdated={handleMemberUpdated}
        currentUserId={user?.id || ''}
      />
    </div>
  );
}
