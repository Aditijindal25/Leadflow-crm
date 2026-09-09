export function ContactForm() {
  return (
    <form className="mt-6 space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none" placeholder="Your name" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input type="email" className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none" placeholder="you@example.com" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none" placeholder="+1 555 123 4567" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Company</label>
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none" placeholder="Your company" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
        <textarea className="min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none" placeholder="Tell us about your project" />
      </div>

      <button type="submit" className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700">
        Submit lead
      </button>
    </form>
  );
}
