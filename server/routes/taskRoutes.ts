import { Router } from 'express';
import { createTask, deleteTask, listTasks, updateTask } from '../controllers/taskController.js';
import { protectRoute } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/permissions.js';

const router = Router();

router.use(protectRoute);
router.get('/', requirePermission('VIEW_TASKS'), listTasks);
router.post('/', requirePermission('MANAGE_TASKS'), createTask);
router.patch('/:id', requirePermission('MANAGE_TASKS'), updateTask);
router.delete('/:id', requirePermission('MANAGE_TASKS'), deleteTask);

export default router;
