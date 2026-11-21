import { Router } from 'express';
import { requestsController } from '../controllers/requestsController.js';

const router = Router();

router.get('/', requestsController.listRequests);
router.get('/:id', requestsController.getRequestById);
router.post('/', requestsController.createRequest);
router.post('/:id/accept', requestsController.acceptRequest);
router.patch('/:id/status', requestsController.updateStatus);

export default router;
