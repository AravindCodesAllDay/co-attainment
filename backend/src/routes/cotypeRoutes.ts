import express from 'express';
import {
  addCotype,
  getCotypes,
  deleteCotype,
} from '../controllers/cotypeController';

const router = express.Router();

router.post('/:userId', addCotype);
router.get('/:userId', getCotypes);
router.delete('/:userId', deleteCotype);

export default router;
