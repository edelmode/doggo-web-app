import express from 'express';
import { getUsers, createUser } from '../controllers/userController.js';

const router = express.Router();

// Route for getting users
router.get('/', getUsers);

// Route for user registration
router.post('/', createUser);

export default router;
