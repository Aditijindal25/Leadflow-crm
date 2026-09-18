import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CrmPageFrame from '../components/CrmPageFrame';
import { listLeads } from '../services/leadService';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const qualifiedCount = leads.filter((lead) => ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED'].includes(lead.status)).length;
  const highIntentCount = leads.filter((lead) => lead.temperature === 'HOT' || lead.intelligence?.temperature === 'HOT').length;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      listLeads({ limit: 100, ...(search.trim() ? { search: search.trim() } : {}) }).then((result) => setLeads(result.data)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  return <CrmPageFrame eyebrow="Lead management" title="Leads" description="Track, qualify, and move opportunities through your sales pipeline."><div className="page-toolbar"><div><strong>{leads.length} active leads</strong><span className="muted"> {search ? 'Matching your search' : 'Sorted by recent activity'}</span><span className="lead-ai-note"><b>AI insight</b> {highIntentCount} high-intent · {qualifiedCount} qualified</span></div><input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, company, or email" aria-label="Search leads by name, company, or email" /></div><section className="panel table-panel"><div className="section-head"><div><p className="eyebrow">Opportunity directory</p><h2>All leads</h2></div><span className="muted">Prioritize the next best action</span></div>{error && <p className="notice error" role="alert">Something went wrong while loading your leads. Please try again.</p>}{loading ? <LeadSkeleton /> : leads.length === 0 ? <div className="empty-state"><strong>{search ? 'No opportunities found' : 'No leads yet'}</strong><span>{search ? 'Try adjusting your search.' : 'Add your first lead to start building your pipeline.'}</span></div> : <div className="table-wrap"><table><thead><tr><th>Name</th><th>Company</th><th>Score</th><th>Status</th><th>Priority</th><th>Next action</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead._id || lead.id}><td><Link className="table-primary-link" to={`/leads/${lead._id || lead.id}`}>{lead.name}</Link><small>{lead.email}</small></td><td>{lead.company || 'Not provided'}</td><td><strong>{lead.leadScore}/100</strong><small className="temperature">{lead.temperature}</small></td><td><span className={`badge badge-${lead.status.toLowerCase()}`}>{lead.status}</span></td><td>{lead.priority}</td><td>{lead.nextAction}</td></tr>)}</tbody></table></div>}</section></CrmPageFrame>;
}

function LeadSkeleton() { return <div className="data-skeleton" aria-label="Loading leads"><span /><span /><span /><span /></div>; }
