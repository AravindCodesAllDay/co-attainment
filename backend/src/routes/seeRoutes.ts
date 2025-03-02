import express from 'express';
import {
  getSeeFromSemester,
  updateSeeScores,
  addSeetype,
  getSeeHeaders,
} from '../controllers/seeController';

const router = express.Router();

router.get('/:batchId/:semId', getSeeFromSemester);
router.get('/headers/:batchId/:semId', getSeeHeaders);
router.post('/', addSeetype);
router.put('/', updateSeeScores);

export default router;
