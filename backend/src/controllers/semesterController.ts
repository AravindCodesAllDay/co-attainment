import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user/userModel';
import { Semester, ISemester } from '../models/semester/semesterModel';
import { verifyToken } from './userController';

// Utility function to handle error responses
const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({ message });
};

// Get all semester titles and IDs from a specific batch
export const getSemesters = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { batchId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(batchId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid user ID or batch ID.');
    }

    const user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }

    const batch = user.batches.find((batch) =>
      (batch as unknown as { _id: mongoose.Types.ObjectId })._id.equals(batchId)
    );

    if (!batch) {
      return handleErrorResponse(res, 404, 'Batch not found.');
    }

    const sems = (batch as unknown as { semlists: ISemester[] }).semlists.map(
      (sem) => ({
        semesterId: sem._id,
        title: sem.title,
      })
    );

    return res.status(200).json(sems);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Add a new semester to a batch
export const addSemester = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { title, batchId } = req.body;

    if (
      !title ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(batchId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid inputs.');
    }

    const user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }

    const batch = user.batches.find((batch) =>
      (batch as unknown as { _id: mongoose.Types.ObjectId })._id.equals(batchId)
    );

    if (!batch) {
      return handleErrorResponse(res, 404, 'Batch not found.');
    }

    const newSem = new Semester({
      title,
      courselists: [],
      ptlists: [],
      seelists: [],
    });

    (batch as unknown as { semlists: ISemester[] }).semlists.push(newSem);
    await user.save();

    return res.status(201).json(newSem);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Delete a semester from a batch
export const deleteSemester = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { batchId, semId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(semId)
    ) {
      return handleErrorResponse(
        res,
        400,
        'Invalid user ID, batch ID, or semester ID.'
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 404, 'User not found');
    }

    const batch = user.batches.find((batch) =>
      (batch as any)._id.equals(batchId)
    );

    if (!batch) {
      return handleErrorResponse(res, 404, 'Batch not found.');
    }

    const semIndex = batch.semlists.findIndex((list) =>
      (list as any)._id.equals(semId)
    );

    if (semIndex === -1) {
      return handleErrorResponse(res, 404, 'Semester not found');
    }

    batch.semlists.splice(semIndex, 1);
    await user.save();

    return res.status(200).json({ message: 'Semester deleted successfully.' });
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};
