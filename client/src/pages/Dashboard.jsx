import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listLeads } from '../services/leadService';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import CrmSidebar from '../components/CrmSidebar';
import ProfileMenu from '../components/ProfileMenu';

export default function Dashboard() {
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tasksDue, setTasksDue] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    listLeads({ limit: 8 }).then((data) => { setLeads(data.data); setMeta(data.meta); }).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
    api.get('/leads/stats').then(({ data }) => setStats(data.data)).catch(() => setStats(null));
    api.get('/tasks?view=today').then(({ data }) => setTasksDue((data.data || []).filter((task) => task.status !== 'COMPLETED').length)).catch(() => setTasksDue(null));
  }, []);

  if (authLoading) return <main className="shell auth-loading"><div className="data-skeleton"><span /><span /><span /></div></main>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED', 'LOST', 'ON_HOLD'];
  const counts = statuses.map((status) => ({ status, count: leads.filter((lead) => lead.status === status).length }));
  const localCounts = Object.fromEntries(counts.map((item) => [item.status, item.count]));
  const statusCounts = stats?.byStatus || localCounts;
  const totalLeads = stats?.total ?? meta?.totalLeads ?? leads.length ?? 0;
  const qualified = ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED'].reduce((sum, status) => sum + (statusCounts[status] || 0), 0);
  const converted = statusCounts.CONVERTED || 0;
  const averageScore = leads.length ? Math.round(leads.reduce((total, lead) => total + lead.leadScore, 0) / leads.length) : 0;
  const hotLeads = leads.filter((lead) => lead.temperature === 'HOT').length;
  const summary = [
    { label: 'Total leads', value: totalLeads, trend: '+12.4%', tone: 'neutral' },
    { label: 'Qualified', value: qualified, trend: '+8.1%', tone: 'positive' },
    { label: 'Conversion', value: `${Math.min(100, Math.round((converted / Math.max(1, leads.length || 1)) * 100))}%`, trend: '+3.2%', tone: 'positive' },
    { label: 'Tasks due', value: tasksDue === null ? '—' : tasksDue, trend: tasksDue === null ? 'Connect task data' : 'Today', tone: 'warning' },
  ];
  const funnel = [
    { label: 'Total', value: totalLeads, color: 'neutral' },
    { label: 'Qualified', value: qualified, color: 'positive' },
    { label: 'Converted', value: converted, color: 'success' },
  ];

  return <main className={`shell crm-shell ${sidebarOpen ? 'sidebar-visible' : ''}`}><button className="sidebar-toggle" type="button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">☰<span>Menu</span></button><div className="crm-layout"><CrmSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><section className="crm-main"><header className="crm-topbar"><div><p className="eyebrow">Operations overview</p><h1>Pipeline performance at a glance</h1><p className="dashboard-subtitle">A focused view of today’s lead momentum and follow-up priorities.</p></div><div className="topbar-actions"><button className="theme-toggle icon-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? '☀' : '☾'}</button><Link className="button button-primary" to="/contact">Add lead</Link><ProfileMenu user={user} onLogout={logout} /></div></header><section className="summary-grid" aria-label="Pipeline summary">{summary.map((item) => <article className={`summary-card summary-card-${item.tone}`} key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.trend}</small></article>)}</section><section className="panel intelligence-panel"><div className="section-head"><div><p className="eyebrow">Performance intelligence</p><h2>Where the pipeline is gaining or losing momentum.</h2></div><Link className="text-link" to="/reports">View full report</Link></div><div className="intelligence-content"><div className="intelligence-grid"><article><span>Average lead score</span><strong>{averageScore}/100</strong><small>Quality across all active leads</small></article><article><span>High-intent leads</span><strong>{hotLeads}</strong><small>Hot opportunities ready for action</small></article><article><span>Follow-up readiness</span><strong>{leads.length ? Math.round((hotLeads / leads.length) * 100) : 0}%</strong><small>Hot leads needing attention now</small></article><article><span>Next best move</span><strong>{hotLeads ? 'Follow up now' : 'Qualify new leads'}</strong><small>Based on current lead signals</small></article></div><div className="funnel-chart" aria-label="Lead funnel from total to qualified to converted"><div className="funnel-head"><span>Lead funnel</span><small>Total → qualified → converted</small></div>{funnel.map((item) => <div className="funnel-row" key={item.label}><span>{item.label}</span><div className="funnel-track"><i className={`funnel-fill funnel-fill-${item.color}`} style={{ width: `${totalLeads ? Math.max(8, (item.value / totalLeads) * 100) : 8}%` }} /></div><strong>{item.value}</strong></div>)}</div></div></section><section className="panel table-panel"><div className="section-head"><div><p className="eyebrow">Latest activity</p><h2>Recent leads</h2></div><span className="muted">{totalLeads} total</span></div>{error && <p className="notice error">{error}</p>}{loading ? <p className="muted">Loading pipeline...</p> : leads.length === 0 ? <p className="muted">No leads found yet.</p> : <div className="table-wrap"><table><thead><tr><th>Name</th><th>Company</th><th>Intelligence</th><th>Status</th><th>Priority</th><th>Created</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead._id || lead.id}><td>{lead.name}<small>{lead.email}</small></td><td>{lead.company || '—'}</td><td><strong>{lead.intelligence?.score ?? lead.leadScore ?? 0}/100</strong><small className="temperature">{lead.intelligence?.temperature || lead.temperature || 'COLD'}</small></td><td><span className={`badge badge-${lead.status.toLowerCase()}`}>{lead.status}</span></td><td>{lead.priority}</td><td>{new Date(lead.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}</section></section></div></main>;
}
