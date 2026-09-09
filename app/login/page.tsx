import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">LeadFlow CRM</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Admin Login</h1>

        <LoginForm />
      </div>
    </main>
  );
}
