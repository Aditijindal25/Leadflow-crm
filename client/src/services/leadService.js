import { api } from './api';
import { normalizeLead } from '../models/leadModel';

export async function listLeads(params = {}) {
  const { data } = await api.get('/leads', { params });
  return { ...data, data: (data.data || []).map(normalizeLead) };
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
