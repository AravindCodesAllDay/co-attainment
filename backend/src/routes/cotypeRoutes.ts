import express from 'express';
import {
  addCotype,
  getCotypes,
  deleteCotype,
} from '../controllers/cotypeController';

const router = express.Router();

router.get('/', getCotypes);
router.post('/', addCotype);
router.delete('/', deleteCotype);

export default router;
