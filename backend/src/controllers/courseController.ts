import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user/userModel';
import { ICoStudent } from '../models/user.model';
import { CoList } from '../models/course/courselModel';

// Utility function to handle error responses
const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({ message });
};

// Get courses from a semester
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { userId, bundleId, semId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId) ||
      !mongoose.Types.ObjectId.isValid(semId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid IDs provided.');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const bundle = user.bundles.find((bundle) => bundle._id.equals(bundleId));
    if (!bundle) return handleErrorResponse(res, 404, 'Bundle not found.');

    const semester = bundle.semlists.find((sem) => sem._id.equals(semId));
    if (!semester) return handleErrorResponse(res, 404, 'Semester not found.');

    const courses = semester.courselists.map((course) => ({
      courseId: course._id,
      title: course.title,
    }));

    return res.status(200).json(courses);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Get course details
export const getCourseDetails = async (req: Request, res: Response) => {
  try {
    const { userId, bundleId, semId, coId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId) ||
      !mongoose.Types.ObjectId.isValid(semId) ||
      !mongoose.Types.ObjectId.isValid(coId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid IDs provided.');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const bundle = user.bundles.find((bundle) => bundle._id.equals(bundleId));
    if (!bundle) return handleErrorResponse(res, 404, 'Bundle not found.');

    const semester = bundle.semlists.find((sem) => sem._id.equals(semId));
    if (!semester) return handleErrorResponse(res, 404, 'Semester not found.');

    const course = semester.courselists.find((co) => co._id.equals(coId));
    if (!course) return handleErrorResponse(res, 404, 'Course not found.');

    return res.status(200).json(course);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Add a new course list
export const addCourseList = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { title, namelistId, bundleId, semId, rows } = req.body;

    if (
      !title ||
      !Array.isArray(rows) ||
      !mongoose.Types.ObjectId.isValid(namelistId) ||
      !mongoose.Types.ObjectId.isValid(bundleId) ||
      !mongoose.Types.ObjectId.isValid(semId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return handleErrorResponse(res, 400, 'All fields must be provided.');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const bundle = user.bundles.find((bundle) => bundle._id.equals(bundleId));
    if (!bundle) return handleErrorResponse(res, 404, 'Bundle not found.');

    const sem = bundle.semlists.find((sem) => sem._id.equals(semId));
    if (!sem) return handleErrorResponse(res, 404, 'Semester not found.');

    const namelist = bundle.namelists.find((namelist) =>
      namelist._id.equals(namelistId)
    );
    if (!namelist) return handleErrorResponse(res, 404, 'Namelist not found.');

    const students = namelist.students.map((student) => {
      const scores = new Map<string, number>();
      rows.forEach((row) => scores.set(row, 0));

      return {
        rollno: student.rollno,
        name: student.name,
        averageScore: 0,
        scores,
      } as ICoStudent;
    });

    const newCoList = new CoList({ title, average: 0, rows, students });
    sem.courselists.push(newCoList);
    await user.save();

    return res.status(201).json(sem);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Delete COlist by ID
export const deleteCourseList = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { coId, bundleId, semId } = req.body;

    if (!coId || !userId || !bundleId || !semId) {
      return handleErrorResponse(res, 400, 'Invalid input data');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const bundle = user.bundles.find((bundle) => bundle._id.equals(bundleId));
    if (!bundle) return handleErrorResponse(res, 404, 'Bundle not found.');

    const sem = bundle.semlists.find((sem) => sem._id.equals(semId));
    if (!sem) return handleErrorResponse(res, 404, 'Semester not found.');

    const coListIndex = sem.courselists.findIndex((list) =>
      list._id.equals(coId)
    );
    if (coListIndex === -1)
      return handleErrorResponse(res, 404, 'COlist not found');

    sem.courselists.splice(coListIndex, 1);
    await user.save();

    return res.status(200).json({ message: 'COlist deleted successfully' });
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};
