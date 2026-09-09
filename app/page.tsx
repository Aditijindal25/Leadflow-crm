'use client';

import { FormEvent, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function HomePage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: 'WEBSITE_FORM' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      await apiFetch('/api/leads', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', email: '', phone: '', source: 'WEBSITE_FORM' });
      setMessage('Thanks. Your request has been received.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to submit your request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">LeadFlow CRM</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Contact us</h1>
        <p className="mt-2 text-slate-600">Tell us about your project and we’ll follow up soon.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">Name</label>
            <input id="name" required minLength={2} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-0" placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input id="email" required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-0" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">Phone <span className="font-normal text-slate-400">(optional)</span></label>
            <input id="phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-0" placeholder="+1 555 000 0000" />
          </div>
          <div>
            <label htmlFor="source" className="mb-1 block text-sm font-medium text-slate-700">How did you find us?</label>
            <select id="source" value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-0">
              <option value="WEBSITE_FORM">Website</option><option value="REFERRAL">Referral</option><option value="LINKEDIN">LinkedIn</option><option value="INSTAGRAM">Instagram</option><option value="EMAIL">Email</option><option value="ADVERTISEMENT">Advertisement</option><option value="OTHER">Other</option>
            </select>
          </div>
          {message && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button disabled={submitting} type="submit" className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Submit lead'}
          </button>
        </form>
      </div>
    </main>
  );
}
