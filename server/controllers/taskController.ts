import type { Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { Lead } from '../models/Lead.js';
import { Task } from '../models/Task.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const taskSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).optional(),
  lead: z.string().refine(isValidObjectId, 'Invalid lead id'),
  assignedTo: z.string().refine(isValidObjectId, 'Invalid assignee id').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  dueDate: z.coerce.date(),
});

const taskUpdateSchema = taskSchema.partial().omit({ lead: true });

function validId(id: string, res: Response) {
  if (!isValidObjectId(id)) {
    res.status(400).json({ success: false, message: 'Invalid task id', code: 'INVALID_ID' });
    return false;
  }
  return true;
}

function dateWindow(view: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  if (view === 'overdue') return { $lt: start };
  if (view === 'today') { end.setDate(end.getDate() + 1); return { $gte: start, $lt: end }; }
  if (view === 'tomorrow') { start.setDate(start.getDate() + 1); end.setDate(end.getDate() + 2); return { $gte: start, $lt: end }; }
  if (view === 'upcoming') { end.setDate(end.getDate() + 7); return { $gte: start, $lt: end }; }
  return undefined;
}

export async function listTasks(req: AuthenticatedRequest, res: Response) {
  const filter: Record<string, unknown> = { organizationId: req.user?.organizationId };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.view) filter.dueDate = dateWindow(String(req.query.view));
  if (req.query.mine === 'true') filter.assignedTo = req.user?.id;

  const tasks = await Task.find(filter)
    .sort({ dueDate: 1, createdAt: -1 })
    .populate('lead', 'name company status')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');
  return res.json({ success: true, data: tasks });
}

export async function createTask(req: AuthenticatedRequest, res: Response) {
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ success: false, message: 'Invalid task payload', errors: parsed.error.flatten().fieldErrors });

  const lead = await Lead.findOne({ _id: parsed.data.lead, organizationId: req.user?.organizationId }).select('_id');
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found in your organization' });

  const task = await Task.create({ ...parsed.data, organizationId: req.user?.organizationId, createdBy: req.user?.id });
  return res.status(201).json({ success: true, data: task });
}

export async function updateTask(req: AuthenticatedRequest, res: Response) {
  const id = String(req.params.id);
  if (!validId(id, res)) return;
  const parsed = taskUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ success: false, message: 'Invalid task update payload' });

  const update = { ...parsed.data, ...(parsed.data.status === 'COMPLETED' ? { completedAt: new Date() } : {}) };
  const task = await Task.findOneAndUpdate({ _id: id, organizationId: req.user?.organizationId }, update, { new: true, runValidators: true })
    .populate('lead', 'name company status').populate('assignedTo', 'name email');
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  return res.json({ success: true, data: task });
}

export async function deleteTask(req: AuthenticatedRequest, res: Response) {
  const id = String(req.params.id);
  if (!validId(id, res)) return;
  const task = await Task.findOneAndDelete({ _id: id, organizationId: req.user?.organizationId });
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  return res.json({ success: true, message: 'Task deleted successfully' });
}
