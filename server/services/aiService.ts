import type { ScoreReason } from './leadIntelligenceService.js';

type AiInput = {
  name: string;
  company?: string | null;
  projectType?: string | null;
  budgetRange?: string | null;
  message?: string | null;
  score: number;
  temperature: string;
  status?: string | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  nextAction: string;
  reasons: ScoreReason[];
};

export type LeadInsight = {
  generatedBy: 'provider' | 'rule-based-fallback';
  summary: string;
  intent: string;
  suggestedPriority: 'LOW' | 'MEDIUM' | 'HIGH';
  nextBestAction: string;
  reason: string;
  followUpTiming: string;
  confidence: number;
  reasons: ScoreReason[];
};

export async function generateLeadInsight(input: AiInput): Promise<LeadInsight> {
  if (!process.env.AI_API_KEY || !process.env.AI_PROVIDER) {
    return fallbackInsight(input);
  }

  try {
    return await generateProviderInsight(input);
  } catch {
    return fallbackInsight(input);
  }
}

async function generateProviderInsight(input: AiInput): Promise<LeadInsight> {
  if (process.env.AI_PROVIDER !== 'openai-compatible') throw new Error('Unsupported AI provider');
  const endpoint = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.AI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are LeadFlow CRM sales intelligence. Use only the CRM data supplied. Do not invent facts, predict conversion, or assume missing information. Return only valid JSON with summary, intent, suggestedPriority, nextBestAction, reason, followUpTiming, and confidence.' },
        { role: 'user', content: JSON.stringify({
          lead: { company: input.company || null, projectType: input.projectType || null, budgetRange: input.budgetRange || null, message: input.message || null, score: input.score, temperature: input.temperature, status: input.status || null, priority: input.priority || null },
          availableSignals: input.reasons,
          currentNextAction: input.nextAction,
        }) },
      ],
    }),
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('AI provider returned no content');
  const parsed = JSON.parse(content.replace(/^```json\s*|\s*```$/g, '')) as Record<string, unknown>;
  const intent = typeof parsed.intent === 'string' ? parsed.intent : null;
  const suggestedPriority = parsed.suggestedPriority;
  const confidence = Number(parsed.confidence);
  if (!['High', 'Medium', 'Early-stage'].includes(intent || '') || !['LOW', 'MEDIUM', 'HIGH'].includes(String(suggestedPriority)) || !Number.isFinite(confidence)) {
    throw new Error('AI provider returned an invalid insight shape');
  }
  return {
    generatedBy: 'provider',
    summary: typeof parsed.summary === 'string' && parsed.summary.trim() ? parsed.summary.trim() : 'Not enough information to generate a reliable summary.',
    intent: intent as LeadInsight['intent'],
    suggestedPriority: String(suggestedPriority) as LeadInsight['suggestedPriority'],
    nextBestAction: typeof parsed.nextBestAction === 'string' && parsed.nextBestAction.trim() ? parsed.nextBestAction.trim() : input.nextAction,
    reason: typeof parsed.reason === 'string' && parsed.reason.trim() ? parsed.reason.trim() : 'Based on the available CRM signals.',
    followUpTiming: typeof parsed.followUpTiming === 'string' ? parsed.followUpTiming : 'Review when appropriate',
    confidence: Math.max(0, Math.min(1, confidence)),
    reasons: input.reasons,
  };
}

function fallbackInsight(input: AiInput): LeadInsight {
  const highIntent = input.temperature === 'HOT';
  const mediumIntent = input.temperature === 'WARM';
  const positiveSignals = input.reasons.filter((reason) => reason.points > 0).map((reason) => reason.label).slice(0, 3);
  const reason = positiveSignals.length ? `${positiveSignals.join(', ')} support this recommendation.` : 'Not enough information to generate a reliable summary.';
  const summary = input.score > 0
    ? `${input.temperature} intent ${input.status ? input.status.toLowerCase() : 'pipeline'} lead${input.company ? ` at ${input.company}` : ''} with a ${input.score}/100 lead score.`
    : 'Not enough information to generate a reliable summary.';
  return {
    generatedBy: 'rule-based-fallback',
    summary,
    intent: highIntent ? 'High' : mediumIntent ? 'Medium' : 'Early-stage',
    suggestedPriority: input.priority || (highIntent ? 'HIGH' : mediumIntent ? 'MEDIUM' : 'LOW'),
    nextBestAction: input.nextAction,
    reason,
    followUpTiming: highIntent ? 'Within 24 hours' : mediumIntent ? 'Within 2 business days' : 'Within 1 week',
    confidence: Math.round(Math.max(0.35, input.score / 100) * 100) / 100,
    reasons: input.reasons,
  };
}
