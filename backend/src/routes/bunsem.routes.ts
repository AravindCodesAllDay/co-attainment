import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

import { User, Bundle, Semester } from '../models/user.model';

const router = express.Router();

const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({ message });
};

// Route to get all bundles for a user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return handleErrorResponse(res, 400, 'Invalid user ID.');
    }

    const user = await User.findById(userId);

    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }

    return res.status(200).json(user.bundles);
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
});

// Route to get all sems of a bundle for a user
router.get('/:bundleId/:userId', async (req: Request, res: Response) => {
  try {
    const { userId, bundleId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid user ID.');
    }

    const user = await User.findById(userId);

    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }
    const bundle = user.bundles.find((bundle) =>
      (bundle as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
        bundleId
      )
    );
    if (!bundle) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    return res.status(200).json(bundle.semlists);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

// Add a new semester
router.post('/sem/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { title, bundleId } = req.body;

    if (
      !title ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid inputs.');
    }

    const user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }

    const bundle = user.bundles.find((bundle) =>
      (bundle as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
        bundleId
      )
    );

    if (!bundle) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    const newSem = new Semester({
      title,
      courselists: [],
      ptlists: [],
      seelists: [],
    });

    (bundle as unknown as { semlists: (typeof newSem)[] }).semlists.push(
      newSem
    );
    await user.save();

    return res.status(201).json(newSem);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

export default router;
