'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Kanban, UserPlus, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(email, password, name);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to register. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[6px] p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" title="Go to Home">
            <img src="/logo.png" alt="Kanban Board" className="h-12 w-auto object-contain mb-4 hover:opacity-90 transition-opacity cursor-pointer" />
          </Link>
          <h2 className="text-2xl font-semibold text-white">Create Account</h2>
          <p className="text-slate-400 text-sm mt-1">Get started with your personal Kanban workspace</p>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 p-3 rounded-[6px] text-sm flex items-center space-x-2 mb-6 font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-slate-950 border border-slate-800 rounded-[6px] px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F99B4F] transition-all font-normal"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-[6px] px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F99B4F] transition-all font-normal"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (Min 6 characters)"
              className="w-full bg-slate-950 border border-slate-800 rounded-[6px] px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F99B4F] transition-all font-normal"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-10 bg-[#E88A3E] hover:bg-[#d6792e] disabled:opacity-50 text-white font-medium text-sm rounded-[6px] transition-all flex items-center justify-center space-x-2 mt-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="text-[#E88A3E] hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
