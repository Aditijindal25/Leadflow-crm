import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CrmPageFrame from '../components/CrmPageFrame';
import { listLeads } from '../services/leadService';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      listLeads({ limit: 100, ...(search.trim() ? { search: search.trim() } : {}) }).then((result) => setLeads(result.data)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  return <CrmPageFrame eyebrow="Relationship workspace" title="Leads" description="Every opportunity, organized for the next best action."><div className="page-toolbar"><div><strong>{leads.length} active records</strong><span className="muted"> {search ? 'Matching your search' : 'Updated moments ago'}</span></div><input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search leads" aria-label="Search leads" /></div><section className="panel table-panel"><div className="section-head"><div><p className="eyebrow">Lead directory</p><h2>All leads</h2></div><span className="muted">Sorted by recent activity</span></div>{error && <p className="notice error" role="alert">{error}</p>}{loading ? <LeadSkeleton /> : leads.length === 0 ? <div className="empty-state"><strong>No leads found</strong><span>Try a different search or add a new lead to your pipeline.</span></div> : <div className="table-wrap"><table><thead><tr><th>Name</th><th>Company</th><th>Score</th><th>Status</th><th>Priority</th><th>Next action</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead._id || lead.id}><td><Link className="table-primary-link" to={`/leads/${lead._id || lead.id}`}>{lead.name}</Link><small>{lead.email}</small></td><td>{lead.company || 'Unassigned'}</td><td><strong>{lead.leadScore}/100</strong><small className="temperature">{lead.temperature}</small></td><td><span className={`badge badge-${lead.status.toLowerCase()}`}>{lead.status}</span></td><td>{lead.priority}</td><td>{lead.nextAction}</td></tr>)}</tbody></table></div>}</section></CrmPageFrame>;
}

function LeadSkeleton() { return <div className="data-skeleton" aria-label="Loading leads"><span /><span /><span /><span /></div>; }
