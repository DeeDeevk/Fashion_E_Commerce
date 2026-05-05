import express from 'express';
import authMiddleware from '../../middlewares/auth.middleware.js';
import { getMyInfo } from './account.controller.js';

const router = express.Router();

router.get('/myinfor', authMiddleware, getMyInfo);

export default router;
