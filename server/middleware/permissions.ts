import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from './authMiddleware.js';

export type Permission =
  | 'VIEW_LEADS'
  | 'CREATE_LEADS'
  | 'EDIT_LEADS'
  | 'DELETE_LEADS'
  | 'EXPORT_LEADS'
  | 'VIEW_ANALYTICS'
  | 'MANAGE_USERS'
  | 'MANAGE_SETTINGS'
  | 'MANAGE_AUTOMATIONS'
  | 'VIEW_AUDIT_LOGS';

const rolePermissions: Record<string, Permission[]> = {
  OWNER: ['VIEW_LEADS', 'CREATE_LEADS', 'EDIT_LEADS', 'DELETE_LEADS', 'EXPORT_LEADS', 'VIEW_ANALYTICS', 'MANAGE_USERS', 'MANAGE_SETTINGS', 'MANAGE_AUTOMATIONS', 'VIEW_AUDIT_LOGS'],
  ADMIN: ['VIEW_LEADS', 'CREATE_LEADS', 'EDIT_LEADS', 'DELETE_LEADS', 'EXPORT_LEADS', 'VIEW_ANALYTICS', 'MANAGE_USERS', 'MANAGE_SETTINGS', 'MANAGE_AUTOMATIONS', 'VIEW_AUDIT_LOGS'],
  MANAGER: ['VIEW_LEADS', 'CREATE_LEADS', 'EDIT_LEADS', 'DELETE_LEADS', 'EXPORT_LEADS', 'VIEW_ANALYTICS'],
  SALES_AGENT: ['VIEW_LEADS', 'CREATE_LEADS', 'EDIT_LEADS'],
  VIEWER: ['VIEW_LEADS', 'VIEW_ANALYTICS'],
};

export function hasPermission(role: string | undefined, permission: Permission) {
  return Boolean(role && rolePermissions[role]?.includes(permission));
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!hasPermission(req.user?.role, permission)) {
      return res.status(403).json({ success: false, message: 'You do not have permission for this action', code: 'FORBIDDEN' });
    }
    next();
  };
}
