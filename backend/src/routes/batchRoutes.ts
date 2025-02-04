import express from 'express';
import {
  getBatches,
  addBatch,
  deleteBatch,
} from '../controllers/batchController';

const router = express.Router();

router.get('/:userId', getBatches);
router.post('/:userId', addBatch);
router.delete('/:userId', deleteBatch);

export default router;
