import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [leads, setLeads] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/leads?limit=8').then(({ data }) => { setLeads(data.data); setMeta(data.meta); }).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)); }, []);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const counts = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'].map((status) => ({ status, count: leads.filter((lead) => lead.status === status).length }));
  return <main className="shell"><nav className="nav"><Link className="brand" to="/">LEADFLOW <span>CRM</span></Link><div className="nav-links"><span className="profile-chip" title={user?.email || 'Signed-in user'}><span className="avatar" aria-hidden="true">{getInitials(user)}</span><span className="profile-name">{user?.name || user?.email}</span></span><button className="theme-toggle" type="button" onClick={toggleTheme}>{theme === 'dark' ? '☀ Light' : '☾ Dark'}</button><button className="button button-dark" onClick={logout}>Logout</button></div></nav><section className="dashboard-head"><div><p className="eyebrow">Operations overview</p><h1>Good work, keep the pipeline moving.</h1></div><Link className="button button-primary" to="/contact">Add lead</Link></section><div className="stat-grid">{counts.map((item) => <article className="stat-card" key={item.status}><span>{item.status}</span><strong>{item.count}</strong></article>)}</div><section className="panel table-panel"><div className="section-head"><div><p className="eyebrow">Latest activity</p><h2>Recent leads</h2></div><span className="muted">{meta?.totalLeads || 0} total</span></div>{error && <p className="notice error">{error}</p>}{loading ? <p className="muted">Loading pipeline...</p> : leads.length === 0 ? <p className="muted">No leads found yet.</p> : <div className="table-wrap"><table><thead><tr><th>Name</th><th>Company</th><th>Intelligence</th><th>Status</th><th>Priority</th><th>Created</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead._id}><td>{lead.name}<small>{lead.email}</small></td><td>{lead.company || '—'}</td><td><strong>{lead.intelligence?.score ?? 0}/100</strong><small className="temperature">{lead.intelligence?.temperature || 'COLD'}</small></td><td><span className={`badge badge-${lead.status.toLowerCase()}`}>{lead.status}</span></td><td>{lead.priority}</td><td>{new Date(lead.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}</section></main>;
}

function getInitials(user) {
  const value = user?.name || user?.email || 'User';
  const parts = value.split(/\s+/).filter(Boolean);
  return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : value.slice(0, 2).toUpperCase();
}
