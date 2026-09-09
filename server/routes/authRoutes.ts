import { Router } from 'express';
import { getCurrentAdmin, login, logout, register } from '../controllers/authController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/me', protectRoute, getCurrentAdmin);

export default router;
