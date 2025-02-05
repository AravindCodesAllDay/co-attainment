import express from 'express';
import {
  getCourses,
  getCourseDetails,
  addCourseList,
  deleteCourseList,
} from '../controllers/courseController';

const router = express.Router();

router.get('/:bundleId/:semId', getCourses);
router.get('/:bundleId/:semId/:coId', getCourseDetails);
router.post('/', addCourseList);
router.delete('/', deleteCourseList);

export default router;
