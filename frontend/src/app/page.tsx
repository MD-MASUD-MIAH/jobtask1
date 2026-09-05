'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Kanban, Shield, Zap, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-10 h-10 border-2 border-slate-800 border-t-[#F99B4F] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <img src="/logo.png" alt="Kanban Board" className="h-9 w-auto object-contain" />
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-[6px] transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium text-white bg-[#E88A3E] hover:bg-[#d6792e] rounded-[6px] transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 my-auto text-center">
        <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 text-[#F99B4F] px-4 py-1.5 rounded-full text-xs font-semibold mb-8">
          <Zap className="w-3.5 h-3.5 text-[#F99B4F]" />
          <span>Real-time Drag & Drop Task Management</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6">
          Streamline your team&apos;s workflow with modern Kanban Boards
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-normal">
          Organize, prioritize, and collaborate effortlessly. Fractional indexing ensures sub-millisecond task reordering with zero race conditions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 text-sm font-medium text-white bg-[#E88A3E] hover:bg-[#d6792e] rounded-[6px] transition-all space-x-2"
          >
            <span>Start Free Today</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 text-sm font-medium text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-[6px] transition-all"
          >
            Sign In to Account
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-left">
          <div className="bg-slate-900 border border-slate-800 rounded-[6px] p-6 shadow-sm">
            <div className="bg-slate-800 text-[#F99B4F] w-11 h-11 rounded-[6px] flex items-center justify-center mb-4 border border-slate-700">
              <Zap className="w-5 h-5 text-[#F99B4F]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Optimistic Drag & Drop</h3>
            <p className="text-slate-400 text-sm font-normal">
              Instant UI responses when moving tasks with automated rollback logic if network sync encounters issues.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[6px] p-6 shadow-sm">
            <div className="bg-slate-800 text-[#F99B4F] w-11 h-11 rounded-[6px] flex items-center justify-center mb-4 border border-slate-700">
              <Users className="w-5 h-5 text-[#F99B4F]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Board Collaborators</h3>
            <p className="text-slate-400 text-sm font-normal">
              Invite team members by email to collaborate on shared boards with explicit role-based permissions.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[6px] p-6 shadow-sm">
            <div className="bg-slate-800 text-[#F99B4F] w-11 h-11 rounded-[6px] flex items-center justify-center mb-4 border border-slate-700">
              <Shield className="w-5 h-5 text-[#F99B4F]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Secure JWT Auth</h3>
            <p className="text-slate-400 text-sm font-normal">
              Complete user isolation, bcrypt password hashing, and board guard middleware to safeguard your data.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 font-medium text-sm bg-slate-950">
        Mini Kanban Board Monorepo Application &copy; 2026. Built for production reliability.
      </footer>
    </div>
  );
}
