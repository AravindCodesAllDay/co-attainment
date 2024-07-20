import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

import { User, Bundle } from '../models/user.model';

const router = express.Router();

// Helper function to handle error responses
const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({ message });
};

// Route to get all bundles and semesters for a user
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

    // Validate the input
    if (!title || !userId) {
      return handleErrorResponse(
        res,
        400,
        'All required fields must be provided.'
      );
    }

    // Validate the user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return handleErrorResponse(res, 400, 'Invalid user ID.');
    }

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }

    // Create a new bundle instance
    const newBundle = new Bundle({
      title,
      namelists: [],
      semlists: [],
    });

    // Add the new bundle to the user's bundles
    user.bundles.push(newBundle);

    // Save the user with the new bundle
    await user.save();

    // Return the updated user
    return res.status(201).json(user);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

// // Add a new semester list
// router.post('/sem/:userId', async (req: Request, res: Response) => {
//   try {
//     const { userId } = req.params;
//     const { title, bundleId } = req.body;

//     if (
//       !title ||
//       !mongoose.Types.ObjectId.isValid(userId) ||
//       !mongoose.Types.ObjectId.isValid(bundleId)
//     ) {
//       return handleErrorResponse(res, 400, 'Invalid inputs.');
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return handleErrorResponse(res, 404, 'User not found.');
//     }

//     const bundle = user.bundles.id(bundleId);

//     if (!bundle) {
//       return handleErrorResponse(res, 404, 'Bundle not found.');
//     }

//     const semlist = await Sem.create({ title });

//     bundle.semlists.push(semlist);
//     await user.save();

//     return res.status(201).json(semlist);
//   } catch (error) {
//     console.error((error as Error).message);
//     return handleErrorResponse(res, 500, 'Internal Server Error');
//   }
// });

export default router;
