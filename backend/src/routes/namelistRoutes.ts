import express from 'express';
import {
  getNamelists,
  createNamelist,
  deleteNamelist,
} from '../controllers/namelistController';

const router = express.Router();

router.get('/:bundleId', getNamelists);
router.post('/', createNamelist);
router.delete('/', deleteNamelist);

export default router;
