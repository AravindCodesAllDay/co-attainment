import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user/userModel';

// Utility function for error handling
const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({ message });
};

// Add a cotype
export const addCotype = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { cotype } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId) || !cotype) {
    return handleErrorResponse(
      res,
      400,
      'User ID and cotype must be provided.'
    );
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }

    user.cotypes.push(cotype);
    await user.save();

    return res
      .status(200)
      .json({ message: 'Cotype added successfully.', cotypes: user.cotypes });
  } catch (error) {
    return res.status(500).json({
      message: 'Error adding cotype',
      error: (error as Error).message,
    });
  }
};

// Get all cotypes
export const getCotypes = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return handleErrorResponse(res, 400, 'User ID must be provided.');
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }

    return res.status(200).json(user.cotypes);
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching cotypes',
      error: (error as Error).message,
    });
  }
};

// Delete a cotype
export const deleteCotype = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { cotype } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId) || !cotype) {
    return handleErrorResponse(
      res,
      400,
      'User ID and cotype must be provided.'
    );
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }

    user.cotypes = user.cotypes.filter((ct) => ct !== cotype);
    await user.save();

    return res
      .status(200)
      .json({ message: 'Cotype deleted successfully.', cotypes: user.cotypes });
  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting cotype',
      error: (error as Error).message,
    });
  }
};
