import express from 'express';
import {
  getSemesters,
  addSemester,
  deleteSemester,
} from '../controllers/semesterController';

const router = express.Router();

// Route to get all semester titles and IDs from a specific bundle
router.get('/:batchId', getSemesters);

// Add a new semester to a bundle
router.post('/', addSemester);

// Delete a semester from a bundle
router.delete('/', deleteSemester);

export default router;
