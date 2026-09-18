import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getLeadSummary, listLeads } from '../services/leadService';
import CrmPageFrame from '../components/CrmPageFrame';

const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED', 'LOST', 'ON_HOLD'];

export default function LeadDetail() {
  const { isAuthenticated } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    api.get(`/leads/${id}`).then(({ data }) => setLead(data.data)).catch(async (requestError) => {
      if (String(id).startsWith('demo-') && import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_MODE === 'true') {
        try {
          const result = await listLeads({ limit: 100 });
          const localLead = result.data.find((item) => item._id === id || item.id === id);
          if (localLead) {
            setLead(localLead);
            return;
          }
        } catch {
          // show the original API error below
        }
      }
      setError(requestError.message);
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setInsightLoading(true);
    getLeadSummary(id).then(setInsight).catch(() => setInsight(null)).finally(() => setInsightLoading(false));
  }, [id]);

  async function updateStatus(event) {
    const status = event.target.value;
    setSaving(true);
    setError('');
    try {
      const { data } = await api.patch(`/leads/${id}`, { status });
      setLead(data.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (loading) return <main className="shell auth-loading"><div className="data-skeleton"><span /><span /><span /></div></main>;
  if (!lead) return <CrmPageFrame eyebrow="Lead workspace" title="Lead unavailable" description={error || 'This lead could not be loaded.'}><button className="button button-light" type="button" onClick={() => navigate('/leads')}>Back to leads</button></CrmPageFrame>;

  return <CrmPageFrame eyebrow="Opportunity overview" title={lead.name} description={lead.company || 'Lead profile and pipeline activity'}><div className="lead-detail-grid"><section className="panel profile-card"><div className="section-head"><div><p className="eyebrow">Contact and pipeline</p><h2>{lead.name}</h2></div><span className={`badge badge-${lead.status.toLowerCase()}`}>{lead.status}</span></div><div className="profile-detail-list"><div><span>Email address</span><strong>{lead.email}</strong></div><div><span>Company</span><strong>{lead.company || 'Not provided'}</strong></div><div><span>Priority</span><strong>{lead.priority || 'MEDIUM'}</strong></div><div><span>Lead score</span><strong>{lead.leadScore ?? lead.intelligence?.score ?? 0}/100 · {lead.temperature || lead.intelligence?.temperature || 'COLD'}</strong></div></div><label className="field"><span>Update pipeline status</span><select value={lead.status} disabled={saving} onChange={updateStatus}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>{error && <p className="notice error" role="alert">Something went wrong while updating this lead. Please try again.</p>}</section><section className="panel profile-card"><div className="section-head"><div><p className="eyebrow">Next best action</p><h2>Keep this lead moving</h2></div></div><p className="detail-callout">{lead.nextAction || 'Review the lead details and choose the next follow-up.'}</p><div className="profile-detail-list"><div><span>Created</span><strong>{lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'Not available'}</strong></div><div><span>Contact preference</span><strong>{lead.preferredContact || 'Not specified'}</strong></div></div><Link className="button button-light" to="/leads">Back to leads</Link></section><section className="panel profile-card ai-lead-panel"><div className="section-head"><div><p className="eyebrow">AI-assisted intelligence</p><h2>Lead summary</h2></div>{insight?.generatedBy && <span className="muted">{insight.generatedBy === 'provider' ? 'AI provider' : 'CRM signal analysis'}</span>}</div>{insightLoading ? <p className="muted">Generating insight...</p> : insight ? <><p className="detail-callout">{insight.summary}</p><div className="ai-detail-grid"><div><span>Intent</span><strong>{insight.intent}</strong></div><div><span>Priority</span><strong>{insight.suggestedPriority}</strong></div><div><span>Next best action</span><strong>{insight.nextBestAction}</strong></div><div><span>Follow-up timing</span><strong>{insight.followUpTiming}</strong></div></div><div className="ai-reason"><span>Why this matters</span><p>{insight.reason || insight.reasons?.map((reason) => reason.label).slice(0, 3).join(' · ') || 'Based on the available CRM signals.'}</p></div></> : <div className="empty-state"><strong>AI insight unavailable</strong><span>Your CRM data is still available. Try again shortly.</span></div>}</section></div></CrmPageFrame>;
}
