import express from 'express';
import {
  getSeeFromSemester,
  getSeeDetails,
  createSeeList,
  updateSeeScores,
  deleteSeeList,
} from '../controllers/seeController';

const router = express.Router();

router.get('/:batchId/:semId', getSeeFromSemester);
router.get('/:batchId/:semId/:seeId', getSeeDetails);
router.post('/', createSeeList);
router.put('/score', updateSeeScores);
router.delete('/', deleteSeeList);

export default router;
