import { useEffect, useState } from 'react';
import CrmPageFrame from '../components/CrmPageFrame';
import { listLeads } from '../services/leadService';

export default function Reports() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listLeads({ limit: 100 }).then((result) => setLeads(result.data)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, []);

  const converted = leads.filter((lead) => lead.status === 'CONVERTED').length;
  const qualified = leads.filter((lead) => ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED'].includes(lead.status)).length;
  const averageScore = leads.length ? Math.round(leads.reduce((total, lead) => total + lead.leadScore, 0) / leads.length) : 0;
  const highIntent = leads.filter((lead) => lead.temperature === 'HOT' || lead.intelligence?.temperature === 'HOT').length;
  const breakdown = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED'].map((status) => ({ status, count: leads.filter((lead) => lead.status === status).length }));

  return <CrmPageFrame eyebrow="Pipeline insights" title="Reports" description="Understand lead quality, movement, and conversion across your sales pipeline.">{error && <p className="notice error">Something went wrong while loading your reports. Please try again.</p>}{loading ? <p className="muted">Loading pipeline insights...</p> : <><div className="report-metrics"><article className="summary-card"><span>Conversion rate</span><strong>{leads.length ? Math.round((converted / leads.length) * 100) : 0}%</strong><small>Converted opportunities / total leads</small></article><article className="summary-card"><span>Qualified pipeline</span><strong>{qualified}</strong><small>Leads meeting qualification criteria</small></article><article className="summary-card"><span>Average lead score</span><strong>{averageScore}</strong><small>Overall quality across leads</small></article></div><section className="ai-briefing report-ai-summary"><div><span className="ai-label">AI performance summary</span><p>{leads.length ? `Your pipeline contains ${leads.length} lead${leads.length === 1 ? '' : 's'}, with ${qualified} qualified opportunit${qualified === 1 ? 'y' : 'ies'} and ${converted} conversion${converted === 1 ? '' : 's'}. ${highIntent ? `${highIntent} high-intent opportunit${highIntent === 1 ? 'y' : 'ies'} currently deserve attention.` : 'No high-intent opportunities are currently flagged.'}` : 'Not enough pipeline activity yet. Reports will become more useful as opportunities move through the pipeline.'}</p><small>Based on current lead status, score, and intent signals.</small></div></section><section className="panel report-panel"><div className="section-head"><div><p className="eyebrow">Pipeline movement</p><h2>Stage distribution</h2></div><span className="muted">Current pipeline signals</span></div><div className="report-bars">{breakdown.map((item) => <div className="report-bar-row" key={item.status}><span>{item.status}</span><div className="report-bar-track"><i style={{ width: `${leads.length ? Math.max(4, (item.count / leads.length) * 100) : 4}%` }} /></div><strong>{item.count}</strong></div>)}</div></section></>}</CrmPageFrame>;
}
