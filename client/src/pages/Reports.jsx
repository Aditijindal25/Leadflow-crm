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
  const breakdown = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED'].map((status) => ({ status, count: leads.filter((lead) => lead.status === status).length }));

  return <CrmPageFrame eyebrow="Analytics workspace" title="Reports" description="A concise view of growth, quality, and conversion health.">{error && <p className="notice error">{error}</p>}{loading ? <p className="muted">Loading report data...</p> : <><div className="report-metrics"><article className="summary-card"><span>Conversion rate</span><strong>{leads.length ? Math.round((converted / leads.length) * 100) : 0}%</strong><small>Lead to customer</small></article><article className="summary-card"><span>Qualified pipeline</span><strong>{qualified}</strong><small>High-intent opportunities</small></article><article className="summary-card"><span>Average lead score</span><strong>{averageScore}</strong><small>Out of 100</small></article></div><section className="panel report-panel"><div className="section-head"><div><p className="eyebrow">Stage performance</p><h2>Lead distribution</h2></div><span className="muted">Current workspace</span></div><div className="report-bars">{breakdown.map((item) => <div className="report-bar-row" key={item.status}><span>{item.status}</span><div className="report-bar-track"><i style={{ width: `${leads.length ? Math.max(4, (item.count / leads.length) * 100) : 4}%` }} /></div><strong>{item.count}</strong></div>)}</div></section></>}</CrmPageFrame>;
}
