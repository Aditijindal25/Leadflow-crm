import { Router } from 'express';
import { addInteraction, createLead, deleteLead, generateLeadSummary, getLeadById, getLeadInsights, getLeadScore, getLeads, getStats, updateLead } from '../controllers/leadController.js';
import { protectRoute } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissions.js';

const router = Router();

router.post('/', createLead);
router.get('/', protectRoute, requirePermission('VIEW_LEADS'), getLeads);
router.get('/stats', protectRoute, requirePermission('VIEW_ANALYTICS'), getStats);
router.get('/:id/score', protectRoute, requirePermission('VIEW_LEADS'), getLeadScore);
router.get('/:id/insights', protectRoute, requirePermission('VIEW_LEADS'), getLeadInsights);
router.post('/:id/ai-summary', protectRoute, requirePermission('VIEW_LEADS'), generateLeadSummary);
router.get('/:id', protectRoute, requirePermission('VIEW_LEADS'), getLeadById);
router.patch('/:id', protectRoute, requirePermission('EDIT_LEADS'), updateLead);
router.delete('/:id', protectRoute, requirePermission('DELETE_LEADS'), deleteLead);
router.post('/:id/interactions', protectRoute, requirePermission('EDIT_LEADS'), addInteraction);

export default router;
