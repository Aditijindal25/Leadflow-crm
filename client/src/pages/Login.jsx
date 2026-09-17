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
  const [form, setForm] = useState({ name: '', email: 'admin@leadflow.local', password: 'leadflow123', organizationName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isRegistering = mode === 'register';

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegistering) {
        const { data } = await api.post('/auth/register', form);
        if (!data?.success) throw new Error(data?.message || 'Unable to create account');
        window.location.assign('/dashboard');
        return;
      }
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return <main className="auth-shell"><section className="auth-brand-panel"><Link className="brand sidebar-brand" to="/"><span className="brand-mark">LF</span><span>LEADFLOW <b>CRM</b></span></Link><div className="auth-brand-copy"><p className="eyebrow">Lead operations, clarified</p><h1>Move every opportunity forward.</h1><p>Capture, qualify, and follow up from one focused workspace.</p></div><span className="auth-brand-meta">Secure workspace access</span></section><section className="auth-form-panel"><div className="auth-form-top"><span className="eyebrow">{isRegistering ? 'Create workspace' : 'Welcome back'}</span><button className="theme-toggle icon-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? '☀' : '☾'}</button></div><h2>{isRegistering ? 'Create your workspace.' : 'Sign in to LeadFlow.'}</h2><p className="muted">{isRegistering ? 'Set up a private workspace for your team and pipeline.' : 'Continue where your pipeline left off.'}</p>{!isRegistering && <p className="demo-hint">Demo access is prefilled for local preview.</p>}<form className="lead-form" onSubmit={submit}>{isRegistering && <div className="form-grid"><Field label="Your name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><Field label="Organization name" value={form.organizationName} onChange={(event) => setForm({ ...form, organizationName: event.target.value })} /></div>}<Field label="Email address" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /><Field label={isRegistering ? 'Password (8+ characters)' : 'Password'} type="password" minLength={isRegistering ? 8 : 6} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />{error && <p className="notice error" role="alert">{error}</p>}<button className="button button-primary submit-button" disabled={loading}>{loading ? (isRegistering ? 'Creating workspace...' : 'Signing in...') : (isRegistering ? 'Create workspace' : 'Sign in')}</button></form><button type="button" className="switch-mode" onClick={() => { setMode(isRegistering ? 'signin' : 'register'); setError(''); }}>{isRegistering ? 'Already have an account? Sign in' : 'New to LeadFlow? Create a workspace'}</button></section></main>;

function Field({ label, ...props }) { return <label className="field"><span>{label}</span><input required {...props} /></label>; }
}

function Field({ label, ...props }) { return <label className="field"><span>{label}</span><input required {...props} /></label>; }
