import { useEffect, useState } from 'react';
import CrmPageFrame from '../components/CrmPageFrame';
import { listLeads } from '../services/leadService';

const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED'];

export default function Pipeline() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listLeads({ limit: 100 }).then((result) => setLeads(result.data)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, []);

  return <CrmPageFrame eyebrow="Revenue motion" title="Pipeline" description="See momentum across every stage and focus the team where it matters."><div className="pipeline-summary"><span><strong>{leads.length}</strong> total opportunities</span><span><strong>{leads.filter((lead) => ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'].includes(lead.status)).length}</strong> in active sales</span><span><strong>{leads.filter((lead) => lead.status === 'CONVERTED').length}</strong> converted this cycle</span></div>{error && <p className="notice error">{error}</p>}{loading ? <p className="muted">Loading pipeline...</p> : <div className="pipeline-grid">{stages.map((stage) => { const stageLeads = leads.filter((lead) => lead.status === stage); return <section className="pipeline-column" key={stage}><div className="pipeline-column-head"><div><span className="eyebrow">Stage</span><h2>{stage}</h2></div><strong>{stageLeads.length}</strong></div>{stageLeads.length === 0 ? <p className="muted">No leads here</p> : stageLeads.map((lead) => <article className="pipeline-lead" key={lead._id || lead.id}><div className="pipeline-lead-top"><strong>{lead.name}</strong><span className={`badge badge-${lead.priority.toLowerCase()}`}>{lead.priority}</span></div><p>{lead.company || lead.email}</p><div className="pipeline-score"><span>Score</span><strong>{lead.leadScore}/100</strong></div></article>)}</section>; })}</div>}</CrmPageFrame>;
}
