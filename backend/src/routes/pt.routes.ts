import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

import { User, IPtList, PtList } from '../models/user.model';

const router = express.Router();

const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
) => {
  return res.status(status).json({ message });
};

//get pt from a semester
router.get('/:bundleId/:semId/:userId', async (req: Request, res: Response) => {
  try {
    const { userId, bundleId, semId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId) ||
      !mongoose.Types.ObjectId.isValid(semId)
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
    const semester = bundle.semlists.find((sem) =>
      (sem as unknown as { _id: mongoose.Types.ObjectId })._id.equals(semId)
    );

    if (!semester) {
      return handleErrorResponse(res, 404, 'Semester not found.');
    }
    const pts = semester.ptlists.map((pt) => ({
      ptId: pt._id,
      title: pt.title,
    }));

    return res.status(200).json(pts);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

//get pt details
router.get(
  '/:bundleId/:semId/:coId/:userId',
  async (req: Request, res: Response) => {
    try {
      const { userId, bundleId, semId, seeId: ptId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(bundleId) ||
        !mongoose.Types.ObjectId.isValid(semId) ||
        !mongoose.Types.ObjectId.isValid(ptId)
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

      const semester = bundle.semlists.find((sem) =>
        (sem as unknown as { _id: mongoose.Types.ObjectId })._id.equals(semId)
      );

      if (!semester) {
        return handleErrorResponse(res, 404, 'Semester not found.');
      }

      const pt = semester.ptlists.find((pt) =>
        (pt as unknown as { _id: mongoose.Types.ObjectId })._id.equals(ptId)
      );

      if (!pt) {
        return handleErrorResponse(res, 404, 'pt not found.');
      }

      return res.status(200).json(pt);
    } catch (error) {
      console.error((error as Error).message);
      return handleErrorResponse(res, 500, 'Internal Server Error');
    }
  }
);

// POST route to create a new PT list
router.post('/pt/create/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { title, structure, bundleId, semId, namelistId } = req.body;

    if (
      !title ||
      !Array.isArray(structure) ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId) ||
      !mongoose.Types.ObjectId.isValid(semId) ||
      !mongoose.Types.ObjectId.isValid(namelistId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid input data');
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

    const sem = bundle.semlists.find((sem) => (sem as any)._id.equals(semId));

    if (!sem) {
      return handleErrorResponse(res, 404, 'Semester not found.');
    }

    const namelist = bundle.namelists.find((namelist) =>
      (namelist as any)._id.equals(namelistId)
    );

    if (!namelist) {
      return handleErrorResponse(res, 404, 'Namelist not found.');
    }

    const populatedStudents = namelist.students.map((student) => ({
      rollno: student.rollno,
      name: student.name,
      totalMark: 0,
      typemark: new Map(),
      parts: [],
    }));

    const newPTList = new PtList({
      title,
      structure,
      students: populatedStudents,
    });

    sem.ptlists.push(newPTList);

    await user.save();

    return res.status(201).json({
      message: 'PT list created successfully',
      ptList: newPTList,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error creating PT list',
      error: (error as Error).message,
    });
  }
});

// PUT route to update student scores in a PT list
router.put('/pt/score/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { ptId, rollno: stdId, scores, bundleId, semId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(ptId) ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId) ||
      !mongoose.Types.ObjectId.isValid(semId) ||
      !scores ||
      typeof scores !== 'object'
    ) {
      return handleErrorResponse(res, 400, 'Invalid input data');
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

    const sem = bundle.semlists.find((sem) => (sem as any)._id.equals(semId));

    if (!sem) {
      return handleErrorResponse(res, 404, 'Semester not found.');
    }

    const ptList = sem.ptlists.find((pt) => (pt as any)._id.equals(ptId));

    if (!ptList) {
      return handleErrorResponse(res, 404, 'PT list not found.');
    }

    const student = ptList.students.find((student) => student.rollno === stdId);

    if (!student) {
      return handleErrorResponse(res, 404, 'Student not found');
    }

    for (const part in scores) {
      if (student.typemark.has(part)) {
        student.typemark.set(part, scores[part]);
      }
    }

    await ptList.save();

    return res.status(200).json({
      message: 'Student scores updated successfully',
      ptList,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating student scores',
      error: (error as Error).message,
    });
  }
});

// DELETE route to delete a PT list
router.delete('/pt/delete/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { ptId, bundleId, semId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(ptId) ||
      !mongoose.Types.ObjectId.isValid(bundleId) ||
      !mongoose.Types.ObjectId.isValid(semId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid input data');
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

    const sem = bundle.semlists.find((sem) => (sem as any)._id.equals(semId));

    if (!sem) {
      return handleErrorResponse(res, 404, 'Semester not found.');
    }

    const ptListIndex = sem.ptlists.findIndex((list) =>
      (list as any)._id.equals(ptId)
    );

    if (ptListIndex === -1) {
      return handleErrorResponse(res, 404, 'PT list not found');
    }

    sem.ptlists.splice(ptListIndex, 1);

    await user.save();

    return res.status(200).json({ message: 'PT list deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting PT list',
      error: (error as Error).message,
    });
  }
});

export default router;
