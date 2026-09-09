'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type Note = { id: string; content: string; createdAt: string };
type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  source: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED';
  createdAt: string;
  notes: Note[];
};

const statuses: Lead['status'][] = ['NEW', 'CONTACTED', 'CONVERTED'];

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<{ success: boolean; data: Lead }>(`/api/leads/${params.id}`)
      .then((result) => setLead(result.data))
      .catch((requestError) => {
        if (requestError instanceof Error && requestError.message.includes('Unauthorized')) {
          router.replace('/admin/login');
          return;
        }
        setError(requestError instanceof Error ? requestError.message : 'Unable to load lead');
      })
      .finally(() => setLoading(false));
  }, [params.id, router]);

  async function updateStatus(status: Lead['status']) {
    if (!lead) return;
    setSaving(true);
    setError('');
    try {
      const result = await apiFetch<{ data: Lead }>(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setLead((current) => current ? { ...current, ...result.data } : current);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update status');
    } finally {
      setSaving(false);
    }
  }

  async function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lead || note.trim().length < 2) return;
    setSaving(true);
    setError('');
    try {
      const result = await apiFetch<{ data: Note }>(`/api/leads/${lead.id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content: note.trim() }),
      });
      setLead((current) => current ? { ...current, notes: [result.data, ...current.notes] } : current);
      setNote('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to add note');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="mx-auto max-w-4xl p-8 text-slate-500">Loading lead...</main>;
  if (!lead) return <main className="mx-auto max-w-4xl p-8"><p className="text-red-700">{error || 'Lead not found'}</p><Link className="mt-4 inline-block text-blue-600" href="/admin/dashboard">Back to dashboard</Link></main>;

  return (
    <main className="mx-auto max-w-4xl p-8">
      <Link href="/admin/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700">← Back to dashboard</Link>
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Lead profile</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{lead.name}</h1>
          <dl className="mt-6 space-y-4 text-sm">
            <div><dt className="text-slate-500">Email</dt><dd className="font-medium text-slate-900">{lead.email}</dd></div>
            <div><dt className="text-slate-500">Phone</dt><dd className="font-medium text-slate-900">{lead.phone || 'Not provided'}</dd></div>
            <div><dt className="text-slate-500">Source</dt><dd className="font-medium text-slate-900">{lead.source}</dd></div>
            <div><dt className="text-slate-500">Created</dt><dd className="font-medium text-slate-900">{new Date(lead.createdAt).toLocaleString()}</dd></div>
          </dl>
          <label htmlFor="status" className="mt-6 block text-sm font-medium text-slate-700">Status</label>
          <select id="status" disabled={saving} value={lead.status} onChange={(event) => updateStatus(event.target.value as Lead['status'])} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Notes</h2>
          <form onSubmit={addNote} className="mt-4">
            <textarea required minLength={2} value={note} onChange={(event) => setNote(event.target.value)} className="min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="Record a follow-up, call, or next step" />
            <button disabled={saving} className="mt-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">Add note</button>
          </form>
          {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="mt-6 space-y-4">
            {lead.notes.length === 0 ? <p className="text-sm text-slate-500">No notes yet.</p> : lead.notes.map((item) => (
              <article key={item.id} className="border-l-2 border-blue-200 pl-4">
                <p className="whitespace-pre-wrap text-sm text-slate-700">{item.content}</p>
                <time className="mt-1 block text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</time>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
