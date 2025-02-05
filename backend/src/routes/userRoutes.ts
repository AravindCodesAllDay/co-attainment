import express from 'express';
import { loginOrCreateUser } from '../controllers/userController';

const router = express.Router();

// Login route or create a new user, and issue a JWT token
router.post('/', loginOrCreateUser);

export default router;
