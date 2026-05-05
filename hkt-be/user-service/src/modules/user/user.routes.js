import express from 'express';
import authMiddleware from '../../middlewares/auth.middleware.js';
import { getProfile, updateProfile } from './user.controller.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/update', authMiddleware, updateProfile);

export default router;
