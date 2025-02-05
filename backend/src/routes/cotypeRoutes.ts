import express from 'express';
import {
  addCotype,
  getCotypes,
  deleteCotype,
} from '../controllers/cotypeController';

const router = express.Router();

router.post('/', addCotype);
router.get('/', getCotypes);
router.delete('/', deleteCotype);

export default router;
