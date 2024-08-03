import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

import { User, IBundle } from '../models/user.model';

const router = express.Router();

const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({ message });
};

// Route to get all bundle titles and IDs
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return handleErrorResponse(res, 400, 'Invalid user ID.');
    }

    const user = await User.findById(userId, 'bundles._id bundles.title'); // Only fetch bundle ID and title

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
});

// Add a new bundle
router.post('/bun/:userId', async (req: Request, res: Response) => {
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

    const newBundle = new (mongoose.model<IBundle>('Bundle'))({
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
});

// Route to delete a bundle
router.delete('/bun/:userId/:bundleId', async (req: Request, res: Response) => {
  try {
    const { userId, bundleId } = req.params;

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

    user.bundles = user.bundles.filter((bundle) => bundle._id !== bundleId);

    await user.save();

    return res.status(200).json({ message: 'Bundle deleted successfully.' });
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

export default router;
