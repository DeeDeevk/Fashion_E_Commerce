import express from 'express';
import authMiddleware from '../../middlewares/auth.middleware.js';
import { getMyInfo } from './account.controller.js';
import { register } from '../auth/auth.controller.js';

const router = express.Router();

// Get account details
router.get('/myinfor', authMiddleware, getMyInfo);

// Register account (matches POST /accounts from FE)
router.post('/', register);

export default router;
