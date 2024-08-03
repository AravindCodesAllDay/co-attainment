import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

import { User, ISem } from '../models/user.model';

const router = express.Router();

const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({ message });
};

// Route to get all sems titles and IDs from a bundle
router.get('/:bundleId/:userId', async (req: Request, res: Response) => {
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

    const bundle = user.bundles.find((bundle) =>
      (bundle as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
        bundleId
      )
    );

    if (!bundle) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    const sems = (bundle as unknown as { semlists: ISem[] }).semlists.map(
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

    const newSem = new (mongoose.model<ISem>('Semester'))({
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

// Route to delete a semester
router.delete(
  '/sem/:userId/:bundleId/:semesterId',
  async (req: Request, res: Response) => {
    try {
      const { userId, bundleId, semesterId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(bundleId) ||
        !mongoose.Types.ObjectId.isValid(semesterId)
      ) {
        return handleErrorResponse(
          res,
          400,
          'Invalid user ID, bundle ID, or semester ID.'
        );
      }

      const user = await User.findById(userId);
      if (!user) {
        return handleErrorResponse(res, 404, 'User not found');
      }

      const bundle = user.bundles.find((bundle) =>
        (bundle as any)._id.equals(bundleId)
      );

      if (!bundle) {
        return handleErrorResponse(res, 404, 'Bundle not found.');
      }

      const updatedSemlists = (bundle as any).semlists.filter(
        (sem: ISem) => sem._id !== semesterId
      );

      (bundle as any).semlists = updatedSemlists;

      await user.save();

      return res
        .status(200)
        .json({ message: 'Semester deleted successfully.' });
    } catch (error) {
      console.error((error as Error).message);
      return handleErrorResponse(res, 500, 'Internal Server Error');
    }
  }
);

export default router;
