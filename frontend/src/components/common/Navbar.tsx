'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Kanban, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2.5 group cursor-pointer">
          <img src="/logo.png" alt="Kanban Board" className="h-9 w-auto object-contain hover:opacity-90 transition-opacity" />
        </Link>

        {user && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-full text-sm">
              <div className="w-6 h-6 rounded-full bg-[#F99B4F] text-white flex items-center justify-center font-semibold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-slate-200 font-medium text-xs sm:text-sm">{user.name}</span>
            </div>

            <button
              onClick={logout}
              className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-[6px] border border-slate-700 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
