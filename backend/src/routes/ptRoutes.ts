import express from 'express';
import {
  getPTs,
  getPTDetails,
  createPT,
  updateStudentScore,
  deletePT,
} from '../controllers/ptController';

const router = express.Router();

router.get('/:bundleId/:semId/:userId', getPTs);
router.get('/:bundleId/:semId/:ptId/:userId', getPTDetails);
router.post('/:userId', createPT);
router.put('/score/:userId', updateStudentScore);
router.delete('/:userId', deletePT);

export default router;
