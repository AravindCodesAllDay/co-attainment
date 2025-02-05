import express from 'express';
import {
  loginOrCreateUser,
  verifyTokenApi,
} from '../controllers/userController';

const router = express.Router();

router.post('/', loginOrCreateUser);

router.get('/verifytoken', verifyTokenApi);

export default router;
