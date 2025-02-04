import express from 'express';
import {
  getCourses,
  getCourseDetails,
  addCourseList,
  deleteCourseList,
} from '../controllers/courseController';

const router = express.Router();

router.get('/:bundleId/:semId/:userId', getCourses);
router.get('/:bundleId/:semId/:coId/:userId', getCourseDetails);
router.post('/:userId', addCourseList);
router.delete('/:userId', deleteCourseList);

export default router;
