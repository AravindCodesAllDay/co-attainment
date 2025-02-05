import express from 'express';
import {
  getSeeFromSemester,
  getSeeDetails,
  createSeeList,
  updateSeeScores,
  deleteSeeList,
} from '../controllers/seeController';

const router = express.Router();

router.get('/:bundleId/:semId', getSeeFromSemester);
router.get('/:bundleId/:semId/:seeId', getSeeDetails);
router.post('/', createSeeList);
router.put('/score', updateSeeScores);
router.delete('/', deleteSeeList);

export default router;
