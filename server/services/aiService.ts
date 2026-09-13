import type { ScoreReason } from './leadIntelligenceService.js';

type AiInput = {
  name: string;
  company?: string | null;
  projectType?: string | null;
  budgetRange?: string | null;
  message?: string | null;
  score: number;
  temperature: string;
  nextAction: string;
  reasons: ScoreReason[];
};

export type LeadInsight = {
  generatedBy: 'provider' | 'rule-based-fallback';
  summary: string;
  intent: string;
  suggestedPriority: 'LOW' | 'MEDIUM' | 'HIGH';
  nextBestAction: string;
  followUpTiming: string;
  confidence: number;
  reasons: ScoreReason[];
};

export async function generateLeadInsight(input: AiInput): Promise<LeadInsight> {
  if (!process.env.AI_API_KEY || !process.env.AI_PROVIDER) {
    return fallbackInsight(input);
  }

  // Provider adapters can be added here without coupling controllers to a vendor.
  // Until configured, deterministic fallback behavior is safer than fabricated AI output.
  return fallbackInsight(input);
}

function fallbackInsight(input: AiInput): LeadInsight {
  const highIntent = input.temperature === 'HOT';
  const mediumIntent = input.temperature === 'WARM';
  return {
    generatedBy: 'rule-based-fallback',
    summary: `${input.name}${input.company ? ` from ${input.company}` : ''} appears to be a ${input.temperature.toLowerCase()}-temperature prospect${input.projectType ? ` interested in ${input.projectType}` : ''}.`,
    intent: highIntent ? 'High' : mediumIntent ? 'Medium' : 'Early-stage',
    suggestedPriority: highIntent ? 'HIGH' : mediumIntent ? 'MEDIUM' : 'LOW',
    nextBestAction: input.nextAction,
    followUpTiming: highIntent ? 'Within 24 hours' : mediumIntent ? 'Within 2 business days' : 'Within 1 week',
    confidence: Math.round(Math.max(0.35, input.score / 100) * 100) / 100,
    reasons: input.reasons,
  };
}
