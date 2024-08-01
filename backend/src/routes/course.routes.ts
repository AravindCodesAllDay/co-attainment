import express, { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { User, Namelist, COlist } from '../models/user.model';

const router = express.Router();

// Utility function to handle error responses
const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({ message });
};

router.post('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { title, namelistId, bundleId, semId, rows } = req.body;

    if (
      !title ||
      !Array.isArray(rows) ||
      !mongoose.Types.ObjectId.isValid(namelistId) ||
      !mongoose.Types.ObjectId.isValid(bundleId) ||
      !mongoose.Types.ObjectId.isValid(semId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return handleErrorResponse(res, 400, 'All fields must be provided.');
    }

    const user = await User.findById(userId);

    if (!user) {
      return handleErrorResponse(res, 404, 'User not found');
    }

    const bundle = user.bundles.find((bundle) =>
      (bundle as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
        bundleId
      )
    );

    if (!bundle) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    const sem = bundle.semlists.find((sem) =>
      (sem as unknown as { _id: mongoose.Types.ObjectId })._id.equals(semId)
    );

    if (!sem) {
      return handleErrorResponse(res, 404, 'Semester not found.');
    }

    const namelist = bundle.namelists.find((namelist) =>
      (namelist as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
        namelistId
      )
    );

    if (!namelist) {
      return handleErrorResponse(res, 404, 'Namelist not found.');
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

    sem.courselists.push(newList);

    await user.save();

    return res.status(201).json(newList);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

// Update Student Score
router.put('/score/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { assignment, score, coId, rollno, bundleId, semId } = req.body;

    if (
      !userId ||
      !assignment ||
      score === undefined ||
      !coId ||
      !bundleId ||
      !semId ||
      !rollno
    ) {
      return handleErrorResponse(res, 400, 'Invalid input data');
    }

    const user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 404, 'User not found');
    }

    const bundle = user.bundles.find((bundle) =>
      (bundle as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
        bundleId
      )
    );

    if (!bundle) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    const sem = bundle.semlists.find((sem) =>
      (sem as unknown as { _id: mongoose.Types.ObjectId })._id.equals(semId)
    );

    if (!sem) {
      return handleErrorResponse(res, 404, 'Semester not found.');
    }

    const coList = sem.courselists.find((list) =>
      (list as unknown as { _id: mongoose.Types.ObjectId })._id.equals(coId)
    );

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
    await user.save();
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
    const { coId, bundleId, semId } = req.body;

    if (!coId || !userId || !bundleId || !semId) {
      return handleErrorResponse(res, 400, 'Invalid input data');
    }

    const user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 404, 'User not found');
    }

    const bundle = user.bundles.find((bundle) =>
      (bundle as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
        bundleId
      )
    );

    if (!bundle) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    const sem = bundle.semlists.find((sem) =>
      (sem as unknown as { _id: mongoose.Types.ObjectId })._id.equals(semId)
    );

    if (!sem) {
      return handleErrorResponse(res, 404, 'Semester not found.');
    }

    const coListIndex = sem.courselists.findIndex((list) =>
      (list as unknown as { _id: mongoose.Types.ObjectId })._id.equals(coId)
    );

    if (coListIndex === -1) {
      return handleErrorResponse(res, 404, 'COlist not found');
    }

    sem.courselists.splice(coListIndex, 1);

    await user.save();
    return res.status(200).json({ message: 'COlist deleted successfully' });
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

export default router;
