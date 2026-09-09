type LeadForScoring = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  projectType?: string | null;
  budgetRange?: string | null;
  message?: string | null;
  source?: string | null;
  followUpDate?: Date | null;
  status?: string | null;
  interactions?: Array<unknown> | null;
  updatedAt?: Date | null;
};

export type ScoreReason = { label: string; points: number };

export function scoreLead(lead: LeadForScoring) {
  const reasons: ScoreReason[] = [];
  let score = 0;

  if (lead.email) { score += 15; reasons.push({ label: 'Email provided', points: 15 }); }
  if (lead.phone) { score += 10; reasons.push({ label: 'Phone provided', points: 10 }); }
  if (lead.company) { score += 10; reasons.push({ label: 'Company information provided', points: 10 }); }
  if (lead.projectType) { score += 12; reasons.push({ label: 'Defined project type', points: 12 }); }
  if (lead.budgetRange && !lead.budgetRange.toLowerCase().includes('under')) { score += 18; reasons.push({ label: 'Budget indicates meaningful project value', points: 18 }); }
  if (lead.message && lead.message.trim().length >= 80) { score += 15; reasons.push({ label: 'Detailed project requirements', points: 15 }); }
  else if (lead.message && lead.message.trim().length >= 25) { score += 8; reasons.push({ label: 'Project requirements included', points: 8 }); }
  if (['REFERRAL', 'LINKEDIN'].includes(lead.source || '')) { score += 5; reasons.push({ label: 'High-intent acquisition source', points: 5 }); }
  if ((lead.interactions?.length || 0) > 0) { score += 12; reasons.push({ label: 'Recent interaction recorded', points: 12 }); }
  if (lead.followUpDate) { score += 8; reasons.push({ label: 'Follow-up scheduled', points: 8 }); }
  else { score -= 5; reasons.push({ label: 'No follow-up scheduled', points: -5 }); }
  if (lead.status === 'CONVERTED') { score += 5; reasons.push({ label: 'Lead is converted', points: 5 }); }

  score = Math.max(0, Math.min(100, score));
  const temperature = score >= 80 ? 'HOT' : score >= 50 ? 'WARM' : 'COLD';
  const nextAction = temperature === 'HOT' ? 'Contact within 24 hours and schedule a discovery call.' : temperature === 'WARM' ? 'Confirm requirements and schedule a qualified follow-up.' : 'Complete the profile and send a helpful first-touch message.';

  return { score, temperature, reasons, nextAction };
}
