import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user/userModel';
import { See } from '../models/see/seeModel';
import { ISeeStudent, SeeStudentModel } from '../models/see/seeStudentModel';
import { verifyToken } from './userController';

const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
) => {
  return res.status(status).json({ message });
};

// Get SEE lists from a semester
export const getSeeFromSemester = async (req: Request, res: Response) => {
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

    const batch = user.batches.find((b) => (b as any)._id.equals(batchId));

    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');

    const semester = batch.semlists.find((s) => (s as any)._id.equals(semId));

    if (!semester) return handleErrorResponse(res, 404, 'Semester not found.');

    const sees = semester.seelists.map((see) => ({
      seeId: see._id,
      title: see.title,
    }));

    return res.status(200).json(sees);
  } catch (error) {
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Get SEE details
export const getSeeDetails = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { batchId, semId, seeId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(semId) ||
      !mongoose.Types.ObjectId.isValid(seeId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid IDs provided.');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const batch = user.batches.find((b) => (b as any)._id.equals(batchId));

    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');

    const semester = batch.semlists.find((s) => (s as any)._id.equals(semId));

    if (!semester) return handleErrorResponse(res, 404, 'Semester not found.');

    const see = semester.seelists.find((s) => (s as any)._id.equals(seeId));

    if (!see) return handleErrorResponse(res, 404, 'SEE list not found.');

    return res.status(200).json(see);
  } catch (error) {
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Create a SEE list
export const createSeeList = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { title, courses, batchId, semId, namelistId } = req.body;

    if (
      !title ||
      !Array.isArray(courses) ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(semId) ||
      !mongoose.Types.ObjectId.isValid(namelistId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid input data');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const batch = user.batches.find((b) => (b as any)._id.equals(batchId));
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');

    const sem = batch.semlists.find((s) => (s as any)._id.equals(semId));
    if (!sem) return handleErrorResponse(res, 404, 'Semester not found.');

    const namelist = batch.namelists.find((n) =>
      (n as any)._id.equals(namelistId)
    );

    if (!namelist) return handleErrorResponse(res, 404, 'Namelist not found.');

    const students: ISeeStudent[] = await Promise.all(
      namelist.students.map(async (student) => {
        const newStudent = new SeeStudentModel({
          _id: new mongoose.Types.ObjectId(), // Provide _id for each student
          rollno: student.rollno,
          name: student.name,
          scores: new Map(courses.map((course) => [course, 0])), // Use Map for scores
        });

        return newStudent;
      })
    );

    const newSEEList = new See({ title, courses, students });
    sem.seelists.push(newSEEList);

    await user.save();

    return res
      .status(201)
      .json({ message: 'SEE list created successfully', seeList: newSEEList });
  } catch (error) {
    return handleErrorResponse(res, 500, 'Error creating SEE list');
  }
};

// Update SEE student scores
export const updateSeeScores = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { seeId, stdId, scores, semId, batchId } = req.body;

    // Validate input data
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(semId) ||
      !mongoose.Types.ObjectId.isValid(seeId) ||
      !mongoose.Types.ObjectId.isValid(stdId) ||
      typeof scores !== 'object' || // Ensure scores is an object
      scores === null
    ) {
      return handleErrorResponse(res, 400, 'Invalid input data');
    }

    // Find user and related documents
    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const sem = user.batches
      .find((b) => (b as any)._id.equals(batchId))
      ?.semlists.find((s) => (s as any)._id.equals(semId));

    if (!sem) return handleErrorResponse(res, 404, 'Semester not found.');

    const see = sem.seelists.find((s) => (s as any)._id.equals(seeId));

    if (!see) return handleErrorResponse(res, 404, 'SEE list not found.');

    const student = see.students.find((s) =>
      (s._id as mongoose.Types.ObjectId).equals(stdId)
    );

    if (!student) return handleErrorResponse(res, 404, 'Student not found.');

    // Update scores for each assignment
    for (const [assignment, score] of Object.entries(scores)) {
      // Ensure that the score is a number
      if (typeof score !== 'number') {
        return handleErrorResponse(res, 400, `Invalid score for ${assignment}`);
      }

      if (!student.scores.has(assignment)) {
        return handleErrorResponse(
          res,
          400,
          `Assignment ${assignment} not found.`
        );
      }

      student.scores.set(assignment, score);
    }

    // Save the updated data
    await user.save();

    // Return the updated SEE list
    return res.status(200).json(see);
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Error updating scores');
  }
};

// Delete SEE list
export const deleteSeeList = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { seeId, semId, batchId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(semId) ||
      !mongoose.Types.ObjectId.isValid(seeId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid input data');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const batch = user.batches.find((b) => (b as any)._id.equals(batchId));
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');

    const semester = batch.semlists.find((s) => (s as any)._id.equals(semId));
    if (!semester) return handleErrorResponse(res, 404, 'Semester not found.');

    const seeIndex = semester.seelists.findIndex((s) =>
      (s as any)._id.equals(seeId)
    );
    if (seeIndex === -1)
      return handleErrorResponse(res, 404, 'SEE list not found.');

    semester.seelists.splice(seeIndex, 1);

    await user.save();

    return res.status(200).json({ message: 'SEE list deleted successfully' });
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Error deleting SEE list');
  }
};
