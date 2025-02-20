import express from 'express';
import {
  getNamelist,
  deleteStudentNamelist,
  editStudentNamelist,
  addStudents2Namelist,
} from '../controllers/namelistController';

const router = express.Router();

router.get('/:batchId', getNamelist);

router.post('/', addStudents2Namelist);

router.put('/', editStudentNamelist);

router.delete('/', deleteStudentNamelist);

export default router;
