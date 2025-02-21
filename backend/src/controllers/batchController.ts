import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { Batch } from '../models/batch/batchModel';
import { User } from '../models/user/userModel';

import { verifyToken } from './userController';

// Utility function to handle error responses
const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({ message });
};

// Get all batch titles and IDs for a user
export const getBatches = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return handleErrorResponse(res, 400, 'Invalid user ID.');
    }

    const user = await User.findById(userId, 'batches._id batches.title');

    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }
    const batches = user.batches.map((batch) => ({
      batchId: batch._id,
      title: batch.title,
    }));

    return res.status(200).json(batches);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Add a new batch
export const addBatch = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { title } = req.body;

    if (!title || !userId) {
      return handleErrorResponse(
        res,
        400,
        'All required fields must be provided.'
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return handleErrorResponse(res, 400, 'Invalid user ID.');
    }

    const user = await User.findById(userId);

    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }

    const newBatch = new Batch({
      title,
      namelists: [],
      semlists: [],
    });

    user.batches.push(newBatch);
    await user.save();

    return res.status(201).json({ message: 'batch creates successfully' });
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Delete a batch
export const deleteBatch = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { batchId } = req.body;

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

    const batchIndex = user.batches.findIndex((list) =>
      (list as any)._id.equals(batchId)
    );

    if (batchIndex === -1) {
      return handleErrorResponse(res, 404, 'Batch not found.');
    }

    user.batches.splice(batchIndex, 1);
    await user.save();

    return res.status(200).json({ message: 'Batch deleted successfully.' });
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};
