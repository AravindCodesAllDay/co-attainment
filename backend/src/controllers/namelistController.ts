import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Namelist } from '../models/namelist/namelistModel';
import { User } from '../models/user/userModel';

// Utility function to handle error responses
const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({ message });
};

// Get all namelists of a specific bundle
export const getNamelists = async (req: Request, res: Response) => {
  try {
    const { userId, bundleId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid user ID or bundle ID.');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const bundle = user.bundles.find((b) =>
      (b as { _id: mongoose.Types.ObjectId })._id.equals(bundleId)
    );
    if (!bundle) return handleErrorResponse(res, 404, 'Bundle not found.');

    return res.status(200).json(bundle.namelists);
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Create a new namelist in a specific bundle
export const createNamelist = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { title, bundleId } = req.body;

    if (
      !title ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId)
    ) {
      return handleErrorResponse(
        res,
        400,
        'All required fields must be provided.'
      );
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const bundle = user.bundles.find((b) =>
      (b as { _id: mongoose.Types.ObjectId })._id.equals(bundleId)
    );
    if (!bundle) return handleErrorResponse(res, 404, 'Bundle not found.');

    const newNamelist = new Namelist({ title, students: [] });
    bundle.namelists.push(newNamelist);

    await user.save();
    return res.status(201).json(newNamelist);
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Delete a namelist
export const deleteNamelist = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { namelistId, bundleId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(namelistId) ||
      !mongoose.Types.ObjectId.isValid(bundleId)
    ) {
      return handleErrorResponse(
        res,
        400,
        'All required fields must be provided.'
      );
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const bundle = user.bundles.find((b) =>
      (b as { _id: mongoose.Types.ObjectId })._id.equals(bundleId)
    );
    if (!bundle) return handleErrorResponse(res, 404, 'Bundle not found.');

    const namelistIndex = bundle.namelists.findIndex((n) =>
      (n as { _id: mongoose.Types.ObjectId })._id.equals(namelistId)
    );
    if (namelistIndex === -1)
      return handleErrorResponse(res, 404, 'Namelist not found.');

    bundle.namelists.splice(namelistIndex, 1);
    await user.save();

    return res.status(200).json({ message: 'Namelist deleted successfully.' });
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};
