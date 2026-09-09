'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type Lead = { id: string; name: string; email: string; source: string; status: 'NEW' | 'CONTACTED' | 'CONVERTED'; createdAt: string };

const statusLabels = { NEW: 'New', CONTACTED: 'Contacted', CONVERTED: 'Converted' };

export default function AnalyticsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiFetch('/api/auth/me'),
      apiFetch<{ data: Lead[] }>('/api/leads'),
    ])
      .then(([, result]) => setLeads(result.data || []))
      .catch((requestError) => {
        if (requestError instanceof Error && requestError.message.includes('Unauthorized')) {
          router.replace('/admin/login');
          return;
        }
        setError(requestError instanceof Error ? requestError.message : 'Unable to load analytics');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const stats = useMemo(() => {
    const byStatus = { NEW: 0, CONTACTED: 0, CONVERTED: 0 };
    const bySource: Record<string, number> = {};
    leads.forEach((lead) => {
      byStatus[lead.status] += 1;
      bySource[lead.source] = (bySource[lead.source] || 0) + 1;
    });
    return { byStatus, bySource, conversionRate: leads.length ? Math.round((byStatus.CONVERTED / leads.length) * 100) : 0 };
  }, [leads]);

  function exportCsv() {
    const rows = [['Name', 'Email', 'Source', 'Status', 'Created'], ...leads.map((lead) => [lead.name, lead.email, lead.source, lead.status, lead.createdAt])];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `leadflow-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <main className="mx-auto max-w-6xl p-8 text-slate-500">Loading analytics...</main>;

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-sm uppercase tracking-[0.18em] text-blue-600">Performance</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Lead analytics</h1><p className="mt-2 text-slate-600">A clear view of pipeline health and acquisition sources.</p></div>
        <button onClick={exportCsv} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Export CSV</button>
      </div>
      {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Metric label="All leads" value={leads.length} />
        <Metric label="New" value={stats.byStatus.NEW} />
        <Metric label="Contacted" value={stats.byStatus.CONTACTED} />
        <Metric label="Conversion rate" value={`${stats.conversionRate}%`} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold text-slate-900">Pipeline</h2><div className="mt-5 space-y-4">{(Object.keys(stats.byStatus) as Lead['status'][]).map((status) => <Bar key={status} label={statusLabels[status]} value={stats.byStatus[status]} total={leads.length} tone={status === 'CONVERTED' ? 'bg-emerald-500' : status === 'CONTACTED' ? 'bg-amber-500' : 'bg-blue-500'} />)}</div></section>
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold text-slate-900">Lead sources</h2><div className="mt-5 space-y-4">{Object.entries(stats.bySource).length === 0 ? <p className="text-sm text-slate-500">No source data yet.</p> : Object.entries(stats.bySource).sort(([, a], [, b]) => b - a).map(([source, value]) => <Bar key={source} label={source} value={value} total={leads.length} tone="bg-slate-700" />)}</div></section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>;
}

function Bar({ label, value, total, tone }: { label: string; value: number; total: number; tone: string }) {
  const width = total ? Math.max((value / total) * 100, value ? 4 : 0) : 0;
  return <div><div className="mb-1 flex justify-between text-sm"><span className="text-slate-600">{label}</span><span className="font-semibold text-slate-900">{value}</span></div><div className="h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${tone}`} style={{ width: `${width}%` }} /></div></div>;
}
