import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listLeads } from '../services/leadService';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import CrmSidebar from '../components/CrmSidebar';
import ProfileMenu from '../components/ProfileMenu';

export default function DashboardRedesign() {
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth > 850);
  const [leads, setLeads] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tasksDue, setTasksDue] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    listLeads({ limit: 100 }).then((data) => {
      setLeads(data.data);
      setMeta(data.meta);
    }).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
    api.get('/leads/stats').then(({ data }) => setStats(data.data)).catch(() => setStats(null));
    api.get('/tasks?view=today').then(({ data }) => setTasksDue((data.data || []).filter((task) => task.status !== 'COMPLETED').length)).catch(() => setTasksDue(null));
  }, []);

  if (authLoading) return <main className="shell auth-loading"><div className="data-skeleton"><span /><span /><span /></div></main>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED', 'LOST', 'ON_HOLD'];
  const localCounts = Object.fromEntries(statuses.map((status) => [status, leads.filter((lead) => lead.status === status).length]));
  const statusCounts = stats?.byStatus || localCounts;
  const totalLeads = stats?.total ?? meta?.totalLeads ?? leads.length ?? 0;
  const qualified = ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED'].reduce((sum, status) => sum + (statusCounts[status] || 0), 0);
  const converted = statusCounts.CONVERTED || 0;
  const averageScore = leads.length ? Math.round(leads.reduce((total, lead) => total + (lead.intelligence?.score ?? lead.leadScore ?? 0), 0) / leads.length) : 0;
  const hotLeads = leads.filter((lead) => (lead.intelligence?.temperature || lead.temperature) === 'HOT').length;
  const highPriorityQualified = leads.filter((lead) => lead.priority === 'HIGH' && ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'].includes(lead.status)).length;
  const readiness = leads.length ? Math.round((hotLeads / leads.length) * 100) : 0;
  const conversion = totalLeads ? Math.round((converted / totalLeads) * 100) : 0;
  const recentLeads = leads.slice(0, 2);
  const nextAction = tasksDue ? 'Clear today\'s follow-ups' : highPriorityQualified ? 'Review high-priority qualified leads' : hotLeads ? 'Follow up with high-intent leads' : 'Review upcoming opportunities';
  const nextActionDetail = tasksDue ? `${tasksDue} follow-up${tasksDue === 1 ? '' : 's'} due today.` : highPriorityQualified ? `${highPriorityQualified} qualified lead${highPriorityQualified === 1 ? '' : 's'} need review.` : hotLeads ? `${hotLeads} lead${hotLeads === 1 ? '' : 's'} currently show strong intent.` : 'No urgent signals are currently reported.';
  const pipelineInsight = `${qualified} of ${totalLeads} lead${totalLeads === 1 ? '' : 's'} are qualified, with ${hotLeads} high-intent opportunit${hotLeads === 1 ? 'y' : 'ies'} currently requiring review.`;
  const briefingPriorities = [nextAction, qualified ? 'Review qualified opportunities' : 'Qualify new leads', tasksDue ? `Complete ${tasksDue} due task${tasksDue === 1 ? '' : 's'}` : 'Review upcoming opportunities'];
  const funnel = [
    { label: 'Total', value: totalLeads, color: 'neutral' },
    { label: 'Qualified', value: qualified, color: 'teal' },
    { label: 'Converted', value: converted, color: 'lime' },
  ];

  return <main className={`shell crm-shell dashboard-shell ${sidebarOpen ? 'sidebar-visible' : ''}`}>
    <button className="sidebar-toggle" type="button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">☰<span>Menu</span></button>
    <div className="crm-layout">
      <CrmSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} showNextAction={false} />
      <section className="crm-main dashboard-main">
        <header className="crm-topbar dashboard-header">
          <div>
            <p className="eyebrow">Operations overview</p>
            <h1>Pipeline overview</h1>
            <p className="dashboard-subtitle">Monitor lead movement, conversion, and follow-up priorities across your pipeline.</p>
          </div>
          <div className="topbar-actions">
            <button className="theme-toggle icon-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? '☀' : '☾'}</button>
            <Link className="button button-primary" to="/contact">Add lead</Link>
            <ProfileMenu user={user} onLogout={logout} />
          </div>
        </header>

        <section className="dashboard-section kpi-section" aria-labelledby="kpi-heading">
          <div className="dashboard-section-label" id="kpi-heading">KPI summary</div>
          <div className="kpi-grid">
            <article className="kpi-item"><span>Total leads</span><strong>{totalLeads}</strong><small>Active opportunities in pipeline</small></article>
            <article className="kpi-item"><span>Qualified</span><strong>{qualified}</strong><small>Leads meeting qualification criteria</small></article>
            <article className="kpi-item"><span>Conversion</span><strong>{conversion}%</strong><small>{converted} converted opportunit{converted === 1 ? 'y' : 'ies'}</small></article>
            <article className="kpi-item kpi-item-muted"><span>Tasks due</span><strong>{tasksDue === null ? '—' : tasksDue}</strong><small>{tasksDue === null ? 'No task activity to show' : 'Follow-ups requiring attention'}</small></article>
          </div>
        </section>

        <section className="dashboard-section pipeline-section" aria-labelledby="pipeline-heading">
          <div className="dashboard-section-heading">
            <div><div className="dashboard-section-label">Pipeline performance</div><h2 id="pipeline-heading">Movement, conversion, and attention signals.</h2></div>
            <Link className="text-link" to="/reports">View report</Link>
          </div>
          <div className="pipeline-layout">
            <div className="pipeline-visual" aria-label="Lead pipeline from total to qualified to converted">
              <div className="visual-heading"><span>Lead movement</span><small>{totalLeads} total leads</small></div>
              <div className="pipeline-bars">{funnel.map((item) => <div className="pipeline-bar-row" key={item.label}><div className="pipeline-bar-label"><span>{item.label}</span><strong>{item.value}</strong></div><div className="pipeline-bar-track"><i className={`pipeline-bar-fill pipeline-bar-fill-${item.color}`} style={{ width: `${totalLeads ? Math.max(4, (item.value / totalLeads) * 100) : 4}%` }} /></div></div>)}</div>
            </div>
            <div className="insights-column">
              <div className="visual-heading"><span>Key insights</span><small>Current pipeline signals</small></div>
              <dl className="insight-list">
                <div><dt>Average lead score</dt><dd>{averageScore}/100</dd></div>
                <div><dt>High-intent leads</dt><dd>{hotLeads}</dd></div>
                <div><dt>Follow-up readiness</dt><dd>{readiness}%</dd></div>
              </dl>
              <div className="next-action"><span>Next best action</span><strong>{nextAction}</strong><small>{nextActionDetail}</small><Link className="button button-secondary" to={tasksDue ? '/tasks' : '/leads'}>{tasksDue ? 'Open tasks' : 'View leads'}</Link></div>
            </div>
          </div>
          <div className="ai-briefing" aria-label="AI-assisted pipeline insight">
            <div><span className="ai-label">AI pipeline insight</span><p>{pipelineInsight}</p><small>Based on current lead score, status, priority, and task signals.</small></div>
            <div className="briefing-priorities"><span>Today&apos;s priorities</span><ol>{briefingPriorities.map((priority, index) => <li key={`${priority}-${index}`}>{priority}</li>)}</ol></div>
          </div>
        </section>

        <section className="dashboard-section activity-section" aria-labelledby="activity-heading">
          <div className="dashboard-section-heading activity-heading">
            <div><div className="dashboard-section-label">Recent pipeline activity</div><h2 id="activity-heading">Recent leads</h2><p>Latest opportunities entering and moving through your pipeline.</p></div>
            <Link className="text-link" to="/leads">View all leads</Link>
          </div>
          {error && <p className="notice error">{error}</p>}
          {loading ? <p className="muted">Loading leads...</p> : leads.length === 0 ? <p className="muted">No opportunities have been added yet.</p> : <div className="activity-table-wrap"><table className="activity-table"><thead><tr><th>Name</th><th>Company</th><th>Intelligence</th><th>Status</th><th>Priority</th><th>Created</th><th aria-label="Actions" /></tr></thead><tbody>{recentLeads.map((lead) => { const score = lead.intelligence?.score ?? lead.leadScore ?? 0; const temperature = lead.intelligence?.temperature || lead.temperature || 'COLD'; return <tr key={lead._id || lead.id}><td><strong>{lead.name}</strong><small>{lead.email}</small></td><td>{lead.company || '—'}</td><td><strong>{score}/100</strong><small className="temperature">{temperature}</small></td><td><span className={`badge badge-${lead.status.toLowerCase()}`}>{lead.status}</span></td><td><span className={`priority priority-${String(lead.priority || '').toLowerCase()}`}>{lead.priority || '—'}</span></td><td>{new Date(lead.createdAt).toLocaleDateString()}</td><td><Link className="row-action" to={`/leads/${lead._id || lead.id}`}>View</Link></td></tr>; })}</tbody></table></div>}
        </section>
      </section>
    </div>
  </main>;
}
