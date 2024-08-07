import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

import { User } from '../models/user.model';

const router = express.Router();

// Add a cotype
router.post('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { cotype } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId) || !cotype) {
    return res
      .status(400)
      .json({ message: 'User ID and cotype must be provided.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
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
});

// Get all cotypes
router.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID must be provided.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const cotypes = user.cotypes;
    return res.status(200).json(cotypes);
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching cotypes',
      error: (error as Error).message,
    });
  }
});

// Delete a cotype
router.delete('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { cotype } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId) || !cotype) {
    return res
      .status(400)
      .json({ message: 'User ID and cotype must be provided.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
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
});

export default router;
