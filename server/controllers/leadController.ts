import type { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { Lead } from '../models/Lead.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { scoreLead } from '../services/leadIntelligenceService.js';
import { generateLeadInsight } from '../services/aiService.js';

const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(120).optional(),
  source: z.enum(['WEBSITE', 'REFERRAL', 'LINKEDIN', 'INSTAGRAM', 'EMAIL', 'ADVERTISEMENT', 'OTHER']).optional(),
  projectType: z.string().trim().max(80).optional(),
  budgetRange: z.string().trim().max(50).optional(),
  preferredContact: z.enum(['EMAIL', 'PHONE', 'WHATSAPP', 'ANY']).optional(),
  preferredContactDetail: z.string().trim().max(160).optional(),
  message: z.string().trim().max(5000).optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED', 'LOST', 'ON_HOLD']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  followUpDate: z.coerce.date().optional(),
});

const updateSchema = leadSchema.partial();
const interactionSchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE']),
  message: z.string().trim().min(2).max(2000),
  date: z.coerce.date().optional(),
});

function validateId(id: string, res: Response) {
  if (!isValidObjectId(id)) {
    res.status(400).json({ success: false, message: 'Invalid lead id' });
    return false;
  }
  return true;
}

export async function createLead(req: Request, res: Response) {
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ success: false, message: 'Invalid lead payload', errors: parsed.error.flatten().fieldErrors });

  const organizationId = process.env.DEFAULT_ORGANIZATION_ID;
  if (!organizationId || !isValidObjectId(organizationId)) return res.status(503).json({ success: false, message: 'Lead capture workspace is not configured', code: 'WORKSPACE_NOT_CONFIGURED' });
  const duplicate = await Lead.findOne({ organizationId, $or: [{ email: parsed.data.email }, ...(parsed.data.phone ? [{ phone: parsed.data.phone }] : [])] }).select('_id name email phone');
  if (duplicate) return res.status(409).json({ success: false, message: 'Potential duplicate lead found.', data: { duplicate } });

  const intelligence = scoreLead(parsed.data);
  const lead = await Lead.create({ ...parsed.data, organizationId, leadScore: intelligence.score, temperature: intelligence.temperature, nextAction: intelligence.nextAction, conversionProbability: intelligence.score / 100 });
  return res.status(201).json({ success: true, data: lead });
}

export async function getLeads(req: AuthenticatedRequest, res: Response) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const search = String(req.query.search || '').trim();
  const filter: Record<string, unknown> = { organizationId: req.user?.organizationId };
  if (search) filter.$text = { $search: search };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.source) filter.source = req.query.source;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.followUpStatus === 'overdue') filter.followUpDate = { $lt: new Date() };

  const [rawLeads, totalLeads] = await Promise.all([
    Lead.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('assignedTo', 'name email'),
    Lead.countDocuments(filter),
  ]);
  const leads = rawLeads.map((lead) => ({ ...lead.toObject(), intelligence: scoreLead(lead) }));

  const totalPages = Math.max(Math.ceil(totalLeads / limit), 1);
  return res.json({ success: true, data: leads, meta: { currentPage: page, totalPages, totalLeads, hasNextPage: page < totalPages, hasPreviousPage: page > 1 } });
}

export async function getLeadById(req: AuthenticatedRequest, res: Response) {
  const id = String(req.params.id);
  if (!validateId(id, res)) return;
  const lead = await Lead.findOne({ _id: id, organizationId: req.user?.organizationId }).populate('assignedTo', 'name email').populate('interactions.createdBy', 'name email');
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  return res.json({ success: true, data: lead });
}

export async function updateLead(req: AuthenticatedRequest, res: Response) {
  const id = String(req.params.id);
  if (!validateId(id, res)) return;
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ success: false, message: 'Invalid lead update payload' });
  const update = { ...parsed.data, ...(parsed.data.status === 'CONVERTED' ? { conversionDate: new Date() } : {}) };
  const lead = await Lead.findOneAndUpdate({ _id: id, organizationId: req.user?.organizationId }, update, { new: true, runValidators: true });
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  return res.json({ success: true, data: lead });
}

export async function deleteLead(req: AuthenticatedRequest, res: Response) {
  const id = String(req.params.id);
  if (!validateId(id, res)) return;
  const lead = await Lead.findOneAndDelete({ _id: id, organizationId: req.user?.organizationId });
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  return res.json({ success: true, message: 'Lead deleted successfully' });
}

export async function addInteraction(req: AuthenticatedRequest, res: Response) {
  const id = String(req.params.id);
  if (!validateId(id, res)) return;
  const parsed = interactionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ success: false, message: 'Invalid interaction payload' });
  const lead = await Lead.findOneAndUpdate({ _id: id, organizationId: req.user?.organizationId }, { $push: { interactions: { ...parsed.data, createdBy: req.user?.id } } }, { new: true, runValidators: true });
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  return res.status(201).json({ success: true, data: lead });
}

export async function getStats(req: AuthenticatedRequest, res: Response) {
  const [total, grouped] = await Promise.all([
    Lead.countDocuments({ organizationId: req.user?.organizationId }),
    Lead.aggregate([{ $match: { organizationId: req.user?.organizationId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);
  return res.json({ success: true, data: { total, byStatus: Object.fromEntries(grouped.map((item) => [item._id, item.count])) } });
}

async function findScopedLead(req: AuthenticatedRequest, res: Response) {
  const id = String(req.params.id);
  if (!validateId(id, res)) return null;
  const lead = await Lead.findOne({ _id: id, organizationId: req.user?.organizationId });
  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found' });
    return null;
  }
  return lead;
}

export async function getLeadScore(req: AuthenticatedRequest, res: Response) {
  const lead = await findScopedLead(req, res);
  if (!lead) return;
  return res.json({ success: true, data: scoreLead(lead) });
}

export async function getLeadInsights(req: AuthenticatedRequest, res: Response) {
  const lead = await findScopedLead(req, res);
  if (!lead) return;
  const intelligence = scoreLead(lead);
  const insight = await generateLeadInsight({ name: lead.name, company: lead.company, projectType: lead.projectType, budgetRange: lead.budgetRange, message: lead.message, ...intelligence });
  return res.json({
    success: true,
    data: insight,
  });
}

export async function generateLeadSummary(req: AuthenticatedRequest, res: Response) {
  const lead = await findScopedLead(req, res);
  if (!lead) return;
  const intelligence = scoreLead(lead);
  const insight = await generateLeadInsight({ name: lead.name, company: lead.company, projectType: lead.projectType, budgetRange: lead.budgetRange, message: lead.message, ...intelligence });
  return res.json({ success: true, data: insight });
}
