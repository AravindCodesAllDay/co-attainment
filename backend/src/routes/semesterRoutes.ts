import express from 'express';
import {
  getSemesters,
  addSemester,
  deleteSemester,
} from '../controllers/semesterController';

const router = express.Router();

// Route to get all semester titles and IDs from a specific bundle
router.get('/:bundleId/:userId', getSemesters);

// Add a new semester to a bundle
router.post('/:userId', addSemester);

// Delete a semester from a bundle
router.delete('/:userId', deleteSemester);

export default router;
