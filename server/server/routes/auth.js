import express from 'express'; 
import { register, login, refreshToken, protectedRoute, forgotPassword, resetPassword } from '../controllers/authController.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.get('/protected', authenticateToken, protectedRoute);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router; 
