import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Bundle } from '../models/user.model';
import { User } from '../models/user/userModel';

// Utility function to handle error responses
const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({ message });
};

// Get all bundle titles and IDs for a user
export const getBundles = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return handleErrorResponse(res, 400, 'Invalid user ID.');
    }

    const user = await User.findById(userId, 'bundles._id bundles.title');

    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }

    const bundles = user.bundles.map((bundle) => ({
      bundleId: bundle._id,
      title: bundle.title,
    }));

    return res.status(200).json(bundles);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Add a new bundle
export const addBundle = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
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

    const newBundle = new Bundle({
      title,
      namelists: [],
      semlists: [],
    });

    user.bundles.push(newBundle);
    await user.save();

    return res.status(201).json(user);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Delete a bundle
export const deleteBundle = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { bundleId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid user ID or bundle ID.');
    }

    const user = await User.findById(userId);

    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }

    const bundleIndex = user.bundles.findIndex((list) =>
      (list as any)._id.equals(bundleId)
    );

    if (bundleIndex === -1) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    user.bundles.splice(bundleIndex, 1);
    await user.save();

    return res.status(200).json({ message: 'Bundle deleted successfully.' });
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};
