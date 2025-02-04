import express from 'express';
import {
  getBundles,
  addBundle,
  deleteBundle,
} from '../controllers/bundleController';

const router = express.Router();

router.get('/:userId', getBundles);
router.post('/:userId', addBundle);
router.delete('/:userId', deleteBundle);

export default router;
