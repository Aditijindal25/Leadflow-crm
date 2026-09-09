 'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">LeadFlow</p>
            <p className="text-sm text-slate-500">Admin Panel</p>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/dashboard" className="text-slate-600 hover:text-slate-900">Leads</Link>
            <Link href="/admin/analytics" className="text-slate-600 hover:text-slate-900">Analytics</Link>
            <button onClick={handleLogout} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Logout</button>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
