import express from 'express';
import {
  getBatches,
  addBatch,
  deleteBatch,
} from '../controllers/batchController';

const router = express.Router();

router.get('/', getBatches);
router.post('/', addBatch);
router.delete('/', deleteBatch);

export default router;
