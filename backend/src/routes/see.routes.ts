import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

import { User, ISee, ISeeStudent, See } from '../models/user.model';

const router = express.Router();

const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
) => {
  return res.status(status).json({ message });
};

//get see from a semester
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
    const sees = semester.seelists.map((see) => ({
      seeId: see._id,
      title: see.title,
    }));

    return res.status(200).json(sees);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

//get see details
router.get(
  '/:bundleId/:semId/:coId/:userId',
  async (req: Request, res: Response) => {
    try {
      const { userId, bundleId, semId, seeId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(bundleId) ||
        !mongoose.Types.ObjectId.isValid(semId) ||
        !mongoose.Types.ObjectId.isValid(seeId)
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

      const see = semester.seelists.find((see) =>
        (see as unknown as { _id: mongoose.Types.ObjectId })._id.equals(seeId)
      );

      if (!see) {
        return handleErrorResponse(res, 404, 'see not found.');
      }

      return res.status(200).json(see);
    } catch (error) {
      console.error((error as Error).message);
      return handleErrorResponse(res, 500, 'Internal Server Error');
    }
  }
);

// POST route to create a new SEE list
router.post('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { title, courses, bundleId, semId, namelistId } = req.body;

    if (
      !title ||
      !Array.isArray(courses) ||
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

    const students: ISeeStudent[] = namelist.students.map((student) => {
      const scores = new Map<string, number>();
      courses.forEach((course) => {
        scores.set(course, 0);
      });

      return {
        rollno: student.rollno,
        name: student.name,
        scores,
      } as ISeeStudent;
    });

    const newSEEList = new See({
      title,
      courses,
      students,
    });

    sem.seelists.push(newSEEList);

    await user.save();

    return res.status(201).json({
      message: 'SEE list created successfully',
      seeList: newSEEList,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error creating SEE list',
      error: (error as Error).message,
    });
  }
});

// PUT route to update student scores in a SEE list
router.put('/score/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { seeId, stdId, scores, semId, bundleId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId) ||
      !mongoose.Types.ObjectId.isValid(semId) ||
      !mongoose.Types.ObjectId.isValid(seeId) ||
      !mongoose.Types.ObjectId.isValid(stdId) ||
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

    const see = sem.seelists.find((see) => (see as any)._id.equals(seeId));

    if (!see) {
      return handleErrorResponse(res, 404, 'SEE list not found.');
    }

    const student = see.students.find((student) =>
      (student._id as mongoose.Types.ObjectId).equals(stdId)
    );

    if (!student) {
      return handleErrorResponse(res, 404, 'Student not found');
    }

    const existingAssignments = Array.from(student.scores.keys());
    const assignmentsToUpdate = Object.keys(scores);
    for (const assignment of assignmentsToUpdate) {
      if (!existingAssignments.includes(assignment)) {
        return handleErrorResponse(
          res,
          400,
          `Assignment ${assignment} not found for the student`
        );
      }
      student.scores.set(assignment, scores[assignment]);
    }

    await user.save();

    return res.status(200).json(see);
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating student scores',
      error: (error as Error).message,
    });
  }
});

// DELETE route to delete a SEE list
router.delete('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { seeId, bundleId, semId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(seeId) ||
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

    const seeListIndex = sem.seelists.findIndex((list) =>
      (list as any)._id.equals(seeId)
    );

    if (seeListIndex === -1) {
      return handleErrorResponse(res, 404, 'SEE list not found');
    }

    sem.seelists.splice(seeListIndex, 1);

    await user.save();

    return res.status(200).json({ message: 'SEE list deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting SEE list',
      error: (error as Error).message,
    });
  }
});

export default router;
