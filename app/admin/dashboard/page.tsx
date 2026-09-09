'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type Lead = {
  id: string;
  name: string;
  email: string;
  source: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED';
  createdAt: string;
};

export default function AdminDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    apiFetch('/api/auth/me').catch(() => router.replace('/admin/login'));
  }, [router]);

  useEffect(() => {
    async function loadLeads() {
      try {
        setError('');
        const query = new URLSearchParams();
        if (search) query.set('search', search);
        if (status !== 'ALL') query.set('status', status);

        const data = await apiFetch<{ success: boolean; data: Lead[] }>(`/api/leads?${query.toString()}`);
        setLeads(data.data || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load leads');
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, [search, status]);

  const stats = useMemo(() => {
    return {
      total: leads.length,
      new: leads.filter((lead) => lead.status === 'NEW').length,
      contacted: leads.filter((lead) => lead.status === 'CONTACTED').length,
      converted: leads.filter((lead) => lead.status === 'CONVERTED').length,
    };
  }, [leads]);

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Leads', value: String(stats.total) },
          { label: 'New', value: String(stats.new) },
          { label: 'Contacted', value: String(stats.contacted) },
          { label: 'Converted', value: String(stats.converted) },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent leads</h2>
          <div className="flex gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-64 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
              placeholder="Search by name or email"
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
            >
              <option value="ALL">All statuses</option>
              <option value="NEW">NEW</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="CONVERTED">CONVERTED</option>
            </select>
          </div>
        </div>

        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {loading ? (
          <p className="text-sm text-slate-500">Loading leads...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Source</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No leads matched your search.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-slate-200">
                      <td className="py-3 pr-4 font-medium text-slate-900"><Link className="hover:text-blue-600" href={`/admin/dashboard/${lead.id}`}>{lead.name}</Link></td>
                      <td className="py-3 pr-4 text-slate-600">{lead.email}</td>
                      <td className="py-3 pr-4 text-slate-600">{lead.source}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
