import { Router } from 'express';
import { chatController } from '../controllers/chatController.js';

const router = Router();

// Token generation endpoint for Nexconn
router.post('/token', chatController.issueUserToken);

// Channel authorization & metadata
router.get('/channel/:requestId', chatController.getRequestChannel);

// Public status check for Nexconn configuration
router.get('/status', chatController.getStatus);

export default router;
