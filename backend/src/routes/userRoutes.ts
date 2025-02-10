import express from 'express';
import {
  CreateUser,
  loginOrCreateUser,
  loginUser,
  verifyTokenApi,
} from '../controllers/userController';

const router = express.Router();

router.post('/', loginOrCreateUser);
router.post('/create', CreateUser);
router.post('/login', loginUser);

router.get('/verifytoken', verifyTokenApi);

export default router;
