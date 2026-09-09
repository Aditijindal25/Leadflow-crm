import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
  organizationName: z.string().trim().min(2).max(120),
});

function slugify(value: string) {
  return `${value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`;
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ success: false, message: 'Enter a name, valid email, organization, and a password with at least 8 characters.' });

  const email = parsed.data.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ success: false, message: 'An account with this email already exists.' });

  const organization = await Organization.create({ name: parsed.data.organizationName, slug: slugify(parsed.data.organizationName) });
  const user = await User.create({
    name: parsed.data.name,
    email,
    password: await bcrypt.hash(parsed.data.password, 12),
    organizationId: organization._id,
    role: 'OWNER',
  });

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, organizationId: organization._id.toString(), role: user.role },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' },
  );
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
  return res.status(201).json({ success: true, message: 'Account created', data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, organizationId: organization._id } } });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid login payload' });
  }

  const { email, password } = parsed.data;

  const admin = await User.findOne({ email, active: true }).select('+password');

  if (!admin) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, admin.password as string);

  if (!validPassword) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: admin._id.toString(), email: admin.email, organizationId: admin.organizationId.toString(), role: admin.role },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user: { id: admin._id, email: admin.email, name: admin.name, role: admin.role, organizationId: admin.organizationId } },
  });
}

export async function getCurrentAdmin(req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    data: { user: (req as any).user || null },
  });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie('token');
  return res.status(200).json({ success: true, message: 'Logged out' });
}
