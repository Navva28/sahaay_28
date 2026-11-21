import { Router } from 'express';
import { authController } from '../controllers/authController.js';

const router = Router();

router.get('/users', authController.listUsers);
router.get('/users/:id', authController.getUser);
router.post('/login', authController.loginOrRegister);

export default router;
