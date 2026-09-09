import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signin') {
        await login(form.email, form.password);
      } else {
        const { data } = await api.post('/auth/register', form);
        if (!data?.success) throw new Error(data?.message || 'Unable to create account');
        window.location.assign('/dashboard');
        return;
      }
      navigate('/dashboard');
    } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  }
  const isRegistering = mode === 'register';
  return <main className="shell centered"><section className="panel login-panel"><div className="login-top"><Link className="brand" to="/">LEADFLOW <span>CRM</span></Link><button className="theme-toggle" type="button" onClick={toggleTheme}>{theme === 'dark' ? '☀ Light' : '☾ Dark'}</button></div><p className="eyebrow">Secure workspace</p><h1>{isRegistering ? 'Create your workspace.' : 'Welcome back.'}</h1><p className="muted">{isRegistering ? 'Start managing your pipeline with a private CRM workspace.' : 'Sign in to continue to your lead pipeline.'}</p><form className="lead-form" onSubmit={submit}>{isRegistering && <><Field label="Your name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><Field label="Organization name" value={form.organizationName} onChange={(event) => setForm({ ...form, organizationName: event.target.value })} /></>}<Field label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /><Field label={isRegistering ? 'Password (8+ characters)' : 'Password'} type="password" minLength={isRegistering ? 8 : 6} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />{error && <p className="notice error" role="alert">{error}</p>}<button className="button button-primary submit-button" disabled={loading}>{loading ? (isRegistering ? 'Creating account...' : 'Signing in...') : (isRegistering ? 'Create account' : 'Sign in')}</button></form><button type="button" className="switch-mode" onClick={() => { setMode(isRegistering ? 'signin' : 'register'); setError(''); }}>{isRegistering ? 'Already have an account? Sign in' : 'New to LeadFlow? Create an account'}</button></section></main>;
}
function Field({ label, ...props }) { return <label className="field"><span>{label}</span><input required {...props} /></label>; }
