import { getAllHistory, getHistoryByUser } from '../controllers/HistoryController.js';
import AuthMiddleware from '../middleware/AuthMiddleware.js';
import express from 'express';
const router = express.Router();

router.get('/api/v1/history', getAllHistory);
router.get('/api/v1/history/user/:userId', getHistoryByUser)

export default router;