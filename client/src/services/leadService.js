import { api } from './api';
import { normalizeLead } from '../models/leadModel';

const DEMO_LEADS = [
  {
    _id: 'demo-lead-1',
    name: 'Maya Chen',
    email: 'maya@northstar.studio',
    company: 'Northstar Studio',
    status: 'QUALIFIED',
    priority: 'HIGH',
    temperature: 'HOT',
    leadScore: 92,
    nextAction: 'Send proposal follow-up',
    createdAt: '2026-09-16T09:30:00.000Z',
  },
  {
    _id: 'demo-lead-2',
    name: 'Ethan Brooks',
    email: 'ethan@apexworks.io',
    company: 'Apex Works',
    status: 'PROPOSAL',
    priority: 'HIGH',
    temperature: 'WARM',
    leadScore: 84,
    nextAction: 'Review pricing options',
    createdAt: '2026-09-15T14:10:00.000Z',
  },
  {
    _id: 'demo-lead-3',
    name: 'Sofia Alvarez',
    email: 'sofia@brightpath.co',
    company: 'Brightpath Co.',
    status: 'CONTACTED',
    priority: 'MEDIUM',
    temperature: 'WARM',
    leadScore: 71,
    nextAction: 'Schedule discovery call',
    createdAt: '2026-09-14T11:45:00.000Z',
  },
  {
    _id: 'demo-lead-4',
    name: 'Jon Bell',
    email: 'jon@fieldhouse.design',
    company: 'Fieldhouse Design',
    status: 'NEW',
    priority: 'MEDIUM',
    temperature: 'COLD',
    leadScore: 58,
    nextAction: 'Complete the lead profile.',
    createdAt: '2026-09-13T16:20:00.000Z',
  },
  {
    _id: 'demo-lead-5',
    name: 'Priya Shah',
    email: 'priya@orbitretail.com',
    company: 'Orbit Retail',
    status: 'CONVERTED',
    priority: 'HIGH',
    temperature: 'HOT',
    leadScore: 97,
    nextAction: 'Prepare onboarding brief',
    createdAt: '2026-09-12T08:05:00.000Z',
  },
];

export async function listLeads(params = {}) {
  try {
    const { data } = await api.get('/leads', { params });
    return { ...data, data: (data.data || []).map(normalizeLead) };
  } catch (error) {
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' && localStorage.getItem('leadflow-demo-user')) {
      return {
        success: true,
        data: DEMO_LEADS.map(normalizeLead),
        meta: { totalLeads: DEMO_LEADS.length },
        demo: true,
      };
    }

    throw error;
  }
}

export async function getLeadIntelligence(id) {
  const [{ data: score }, { data: insights }] = await Promise.all([
    api.get(`/leads/${id}/score`),
    api.get(`/leads/${id}/insights`),
  ]);
  return { score: score.data, insights: insights.data };
}

export async function createLead(payload) {
  const { data } = await api.post('/leads', payload);
  return normalizeLead(data.data);
}
