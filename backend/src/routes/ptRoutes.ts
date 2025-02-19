import express from 'express';
import {
  getPTs,
  getPTDetails,
  createPT,
  updateStudentScore,
  deletePT,
} from '../controllers/ptController';

const router = express.Router();

router.get('/:batchId/:semId', getPTs);
router.get('/:batchId/:semId/:ptId', getPTDetails);
router.post('/', createPT);
router.put('/score', updateStudentScore);
router.delete('/', deletePT);

export default router;
