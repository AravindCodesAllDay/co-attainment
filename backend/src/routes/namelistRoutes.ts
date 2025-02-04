import express from 'express';
import {
  getNamelists,
  createNamelist,
  deleteNamelist,
} from '../controllers/namelistController';

const router = express.Router();

router.get('/:bundleId/:userId', getNamelists);
router.post('/:userId', createNamelist);
router.delete('/:userId', deleteNamelist);

export default router;
