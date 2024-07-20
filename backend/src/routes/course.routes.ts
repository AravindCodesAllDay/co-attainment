import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { COlist } from '../models/colist.model';
import { Namelist } from '../models/namelist.model';
import { User } from '../models/user.model';

const router = express.Router();

// Utility function to handle error responses
const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({ message });
};

// Helper function to verify user ownership of COlist
const verifyUserOwnership = async (
  userId: string,
  listId: string,
  listType: string
): Promise<void> => {
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(listId)
  ) {
    throw new Error('Invalid user ID or list ID.');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found.');
  }

  let found = false;
  for (const bundle of user.bundles) {
    if (bundle[listType].includes(listId)) {
      found = true;
      break;
    }
  }

  if (!found) {
    throw new Error('List not associated with the user.');
  }
};

// GET route to retrieve all COlist titles and IDs for a user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return handleErrorResponse(res, 400, 'Invalid user ID');
    }

    const user = await User.findById(userId).populate(
      'courselists',
      'title _id'
    );

    if (!user) {
      return handleErrorResponse(res, 404, 'User not found');
    }

    return res.status(200).json(user.courselists);
  } catch (err) {
    console.error((err as Error).message);
    return handleErrorResponse(res, 500, (err as Error).message);
  }
});

// GET route to retrieve student details for a specific COlist
router.get('/colist/:coId/:userId', async (req: Request, res: Response) => {
  try {
    const { userId, coId } = req.params;

    if (!userId || !coId) {
      return handleErrorResponse(res, 400, 'Invalid user ID or COlist ID');
    }

    await verifyUserOwnership(userId, coId, 'courselists');

    const coList = await COlist.findById(coId);

    if (!coList) {
      return handleErrorResponse(res, 404, 'COlist not found');
    }

    return res.status(200).json(coList);
  } catch (err) {
    console.error((err as Error).message);
    return handleErrorResponse(res, 500, (err as Error).message);
  }
});

// Route to create a new COlist based on an existing Namelist
router.post('/create/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { title, namelistId, rows } = req.body;

    if (!title || !Array.isArray(rows) || !namelistId || !userId) {
      return handleErrorResponse(res, 400, 'All fields must be provided.');
    }

    const namelist = await Namelist.findById(namelistId);

    if (!namelist) {
      return handleErrorResponse(res, 404, 'NameList not found.');
    }

    const user = await User.findById(userId);

    if (!user) {
      return handleErrorResponse(res, 404, 'User not found');
    }

    const students = namelist.students.map((student) => {
      const scores = new Map<string, number>();
      rows.forEach((row) => {
        scores.set(row, 0);
      });

      return {
        rollno: student.rollno,
        name: student.name,
        scores,
      };
    });

    const newList = new COlist({
      title,
      rows,
      students,
    });

    await newList.save();
    user.courselists.push(newList._id);
    await user.save();

    return res.status(201).json(newList);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

// Add or Update Student Score
router.put('/score/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { assignment, score, coId, rollno } = req.body;

    if (!coId || !userId || !assignment || score === undefined) {
      return handleErrorResponse(res, 400, 'Invalid input data');
    }

    await verifyUserOwnership(userId, coId, 'courselists');

    const coList = await COlist.findById(coId);
    if (!coList) {
      return handleErrorResponse(res, 404, 'COlist not found');
    }

    const student = coList.students.find(
      (student) => student.rollno === rollno
    );
    if (!student) {
      return handleErrorResponse(res, 404, 'Student not found');
    }

    student.scores.set(assignment, score);
    await coList.save();
    return res.status(200).json(coList);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

// Delete COlist by ID
router.delete('/delete/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { coId } = req.body;

    if (!coId || !userId) {
      return handleErrorResponse(res, 400, 'Invalid input data');
    }

    await verifyUserOwnership(userId, coId, 'courselists');

    const coList = await COlist.findByIdAndDelete(coId);

    if (!coList) {
      return handleErrorResponse(res, 404, 'COlist not found');
    }

    const user = await User.findById(userId);
    user.courselists = user.courselists.filter(
      (listId) => listId.toString() !== coId
    );
    await user.save();

    return res.status(200).json({ message: 'COlist deleted successfully' });
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

export default router;
