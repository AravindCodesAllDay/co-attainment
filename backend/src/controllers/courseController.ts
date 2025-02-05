import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user/userModel';
import { CoList } from '../models/course/courselModel';
import { ICoStudent } from '../models/course/coStudentModel';
import { IBatch } from '../models/batch/batchModel';
import { ISemester } from '../models/semester/semesterModel';
import { ICoList } from '../models/course/courselModel';
import { verifyToken } from './userController';

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
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { batchId, semId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(semId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid IDs provided.');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const batch = user.batches.find((batch: IBatch) =>
      batch._id.equals(batchId)
    ) as IBatch; // Explicitly type the batch as IBatch
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');

    const semester = batch.semlists.find((sem: ISemester) =>
      sem._id.equals(semId)
    ) as ISemester; // Explicitly type the semester as ISemester
    if (!semester) return handleErrorResponse(res, 404, 'Semester not found.');

    const courses = semester.courselists.map((course: ICoList) => ({
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
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { batchId, semId, coId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(semId) ||
      !mongoose.Types.ObjectId.isValid(coId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid IDs provided.');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const batch = user.batches.find((batch: IBatch) =>
      batch._id.equals(batchId)
    ) as IBatch; // Explicitly type the batch as IBatch
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');

    const semester = batch.semlists.find((sem: ISemester) =>
      sem._id.equals(semId)
    ) as ISemester; // Explicitly type the semester as ISemester
    if (!semester) return handleErrorResponse(res, 404, 'Semester not found.');

    const course = semester.courselists.find((co: ICoList) =>
      co._id.equals(coId)
    ) as ICoList; // Explicitly type the course as ICo
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
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { title, namelistId, batchId, semId, rows } = req.body;

    if (
      !title ||
      !Array.isArray(rows) ||
      !mongoose.Types.ObjectId.isValid(namelistId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(semId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return handleErrorResponse(res, 400, 'All fields must be provided.');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const batch = user.batches.find((batch: IBatch) =>
      batch._id.equals(batchId)
    ) as IBatch; // Explicitly type the batch as IBatch
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');

    const sem = batch.semlists.find((sem: ISemester) => sem._id.equals(semId)); // Explicitly typing the semester as ISemester
    if (!sem) return handleErrorResponse(res, 404, 'Semester not found.');

    const namelist = batch.namelists.find((namelist) =>
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
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { coId, batchId, semId } = req.body;

    if (!coId || !userId || !batchId || !semId) {
      return handleErrorResponse(res, 400, 'Invalid input data');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const batch = user.batches.find((batch: IBatch) =>
      batch._id.equals(batchId)
    ) as IBatch; // Explicitly type the batch as IBatch
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');

    const sem = batch.semlists.find((sem: ISemester) => sem._id.equals(semId)); // Explicitly typing the semester as ISemester
    if (!sem) return handleErrorResponse(res, 404, 'Semester not found.');

    const coListIndex = sem.courselists.findIndex((list: ICoList) =>
      list._id.equals(coId)
    ); // Explicitly typing the course as ICo
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
