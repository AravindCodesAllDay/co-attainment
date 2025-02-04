import express from 'express';
import {
  getSeeFromSemester,
  getSeeDetails,
  createSeeList,
  updateSeeScores,
  deleteSeeList,
} from '../controllers/seecontroller';

const router = express.Router();

router.get('/:bundleId/:semId/:userId', getSeeFromSemester);
router.get('/:bundleId/:semId/:seeId/:userId', getSeeDetails);
router.post('/:userId', createSeeList);
router.put('/score/:userId', updateSeeScores);
router.delete('/:userId', deleteSeeList);

export default router;
