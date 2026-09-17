import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { listLeads } from '../services/leadService';
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

  return <CrmPageFrame eyebrow="Lead workspace" title={lead.name} description={lead.company || 'Lead profile and activity'}><div className="lead-detail-grid"><section className="panel profile-card"><div className="section-head"><div><p className="eyebrow">Identity</p><h2>{lead.name}</h2></div><span className={`badge badge-${lead.status.toLowerCase()}`}>{lead.status}</span></div><div className="profile-detail-list"><div><span>Email address</span><strong>{lead.email}</strong></div><div><span>Company</span><strong>{lead.company || 'Not provided'}</strong></div><div><span>Priority</span><strong>{lead.priority || 'MEDIUM'}</strong></div><div><span>Lead score</span><strong>{lead.leadScore ?? lead.intelligence?.score ?? 0}/100 · {lead.temperature || lead.intelligence?.temperature || 'COLD'}</strong></div></div><label className="field"><span>Update status</span><select value={lead.status} disabled={saving} onChange={updateStatus}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>{error && <p className="notice error" role="alert">{error}</p>}</section><section className="panel profile-card"><div className="section-head"><div><p className="eyebrow">Next action</p><h2>Keep the relationship moving</h2></div></div><p className="detail-callout">{lead.nextAction || 'Complete the lead profile.'}</p><div className="profile-detail-list"><div><span>Created</span><strong>{lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'Not available'}</strong></div><div><span>Contact preference</span><strong>{lead.preferredContact || 'Not specified'}</strong></div></div><Link className="button button-light" to="/leads">Back to leads</Link></section></div></CrmPageFrame>;
}
