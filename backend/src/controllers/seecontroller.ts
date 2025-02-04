import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user/userModel';
import { See } from '../models/see/seeModel';
import { ISeeStudent } from '../models/user.model';

const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
) => {
  return res.status(status).json({ message });
};

// Get SEE lists from a semester
export const getSeeFromSemester = async (req: Request, res: Response) => {
  try {
    const { userId, bundleId, semId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId) ||
      !mongoose.Types.ObjectId.isValid(semId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid IDs provided.');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const bundle = user.bundles.find((b) => (b as any)._id.equals(bundleId));

    if (!bundle) return handleErrorResponse(res, 404, 'Bundle not found.');

    const semester = bundle.semlists.find((s) => (s as any)._id.equals(semId));

    if (!semester) return handleErrorResponse(res, 404, 'Semester not found.');

    const sees = semester.seelists.map((see) => ({
      seeId: see._id,
      title: see.title,
    }));

    return res.status(200).json(sees);
  } catch (error) {
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Get SEE details
export const getSeeDetails = async (req: Request, res: Response) => {
  try {
    const { userId, bundleId, semId, seeId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId) ||
      !mongoose.Types.ObjectId.isValid(semId) ||
      !mongoose.Types.ObjectId.isValid(seeId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid IDs provided.');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const bundle = user.bundles.find((b) => (b as any)._id.equals(bundleId));

    if (!bundle) return handleErrorResponse(res, 404, 'Bundle not found.');

    const semester = bundle.semlists.find((s) => (s as any)._id.equals(semId));

    if (!semester) return handleErrorResponse(res, 404, 'Semester not found.');

    const see = semester.seelists.find((s) => (s as any)._id.equals(seeId));

    if (!see) return handleErrorResponse(res, 404, 'SEE list not found.');

    return res.status(200).json(see);
  } catch (error) {
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Create a SEE list
export const createSeeList = async (req: Request, res: Response) => {
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
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const bundle = user.bundles.find((b) => (b as any)._id.equals(bundleId));
    if (!bundle) return handleErrorResponse(res, 404, 'Bundle not found.');

    const sem = bundle.semlists.find((s) => (s as any)._id.equals(semId));
    if (!sem) return handleErrorResponse(res, 404, 'Semester not found.');

    const namelist = bundle.namelists.find((n) =>
      (n as any)._id.equals(namelistId)
    );

    if (!namelist) return handleErrorResponse(res, 404, 'Namelist not found.');

    const students: ISeeStudent[] = namelist.students.map((student) => ({
      rollno: student.rollno,
      name: student.name,
      scores: new Map(courses.map((course) => [course, 0])),
    }));

    const newSEEList = new See({ title, courses, students });
    sem.seelists.push(newSEEList);

    await user.save();

    return res
      .status(201)
      .json({ message: 'SEE list created successfully', seeList: newSEEList });
  } catch (error) {
    return handleErrorResponse(res, 500, 'Error creating SEE list');
  }
};

// Update SEE student scores
export const updateSeeScores = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { seeId, stdId, scores, semId, bundleId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId) ||
      !mongoose.Types.ObjectId.isValid(semId) ||
      !mongoose.Types.ObjectId.isValid(seeId) ||
      !mongoose.Types.ObjectId.isValid(stdId) ||
      typeof scores !== 'object'
    ) {
      return handleErrorResponse(res, 400, 'Invalid input data');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const sem = user.bundles
      .find((b) => (b as any)._id.equals(bundleId))
      ?.semlists.find((s) => (s as any)._id.equals(semId));

    const see = sem?.seelists.find((s) => (s as any)._id.equals(seeId));

    if (!see) return handleErrorResponse(res, 404, 'SEE list not found.');

    const student = see.students.find((s) =>
      (s._id as mongoose.Types.ObjectId).equals(stdId)
    );

    if (!student) return handleErrorResponse(res, 404, 'Student not found.');

    for (const [assignment, score] of Object.entries(scores)) {
      if (!student.scores.has(assignment)) {
        return handleErrorResponse(
          res,
          400,
          `Assignment ${assignment} not found.`
        );
      }
      student.scores.set(assignment, score);
    }

    await user.save();
    return res.status(200).json(see);
  } catch (error) {
    return handleErrorResponse(res, 500, 'Error updating scores');
  }
};

// Delete SEE list
export const deleteSeeList = async (req: Request, res: Response) => {
  return res.status(200).json({ message: 'Delete SEE list route' });
};
