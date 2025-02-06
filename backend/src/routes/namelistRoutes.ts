import express from 'express';
import {
  getNamelists,
  createNamelist,
  deleteNamelist,
  addStudentNamelist,
  getStudentsNamelist,
  deleteStudentNamelist,
  editStudentNamelist,
} from '../controllers/namelistController';

const router = express.Router();

router.get('/:batchId', getNamelists);
router.post('/', createNamelist);
router.delete('/', deleteNamelist);

// Get students in a namelist
router.get('/student/:bundleId/:namelistId', getStudentsNamelist);

// Add a student to a namelist
router.post('/student', addStudentNamelist);

// Update student details in a namelist
router.put('/student', editStudentNamelist);

// Delete a student from a namelist
router.delete('/student', deleteStudentNamelist);

export default router;
