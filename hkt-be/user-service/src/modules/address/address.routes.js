import express from 'express';
import authMiddleware from '../../middlewares/auth.middleware.js';
import * as addressController from './address.controller.js';

const router = express.Router();

router.get('/:accountId', authMiddleware, addressController.getAddresses);
router.post('/add', authMiddleware, addressController.addAddress);
router.put('/update', authMiddleware, addressController.updateAddress);
router.delete('/:id', authMiddleware, addressController.deleteAddress);

export default router;
