export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED', 'LOST', 'ON_HOLD'];
export const LEAD_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
export const LEAD_TEMPERATURES = ['HOT', 'WARM', 'COLD'];

export function normalizeLead(lead) {
  const leadScore = Number(lead.leadScore ?? lead.intelligence?.score ?? 0);
  const temperature = lead.temperature || lead.intelligence?.temperature || 'COLD';
  const nextAction = lead.nextAction || lead.intelligence?.nextAction || 'Complete the lead profile.';

  return {
    ...lead,
    id: lead.id || lead._id,
    leadScore,
    temperature,
    nextAction,
    intelligence: lead.intelligence || { score: leadScore, temperature, nextAction },
    conversionProbability: Number(lead.conversionProbability ?? 0),
    interactions: Array.isArray(lead.interactions) ? lead.interactions : [],
  };
}

export function getLeadInitials(lead) {
  return String(lead?.name || 'Lead').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}
