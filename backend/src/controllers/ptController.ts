import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { PtList } from '../models/pt/ptListModel';
import { User } from '../models/user/userModel';
import { verifyToken } from './userController';

const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
) => {
  return res.status(status).json({ message });
};

// Get PTs from a semester
export const getPTs = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { batchId, semId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(semId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid user ID or batch ID.');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const batch = user.batches.find((b) => (b as any)._id.equals(batchId));
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');

    const semester = batch.semlists.find((s) => (s as any)._id.equals(semId));
    if (!semester) return handleErrorResponse(res, 404, 'Semester not found.');

    const pts = semester.ptlists.map((pt) => ({
      ptId: pt._id,
      title: pt.title,
    }));

    return res.status(200).json(pts);
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Get PT details
export const getPTDetails = async (req: Request, res: Response) => {
  try {
    const { batchId, semId, ptId } = req.params;
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(semId) ||
      !mongoose.Types.ObjectId.isValid(ptId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid input data');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const batch = user.batches.find((b) => (b as any)._id.equals(batchId));
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');

    const semester = batch.semlists.find((s) => (s as any)._id.equals(semId));
    if (!semester) return handleErrorResponse(res, 404, 'Semester not found.');

    const pt = semester.ptlists.find((p) => (p as any)._id.equals(ptId));
    if (!pt) return handleErrorResponse(res, 404, 'PT not found.');
    return res.status(200).json(pt);
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Create a new PT list
export const createPT = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { title, structure, batchId, semId } = req.body;

    if (!title) return handleErrorResponse(res, 400, 'Title is required');
    if (!Array.isArray(structure))
      return handleErrorResponse(res, 400, 'Structure must be an array');

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found');

    const batch = user.batches.find((b) => (b as any)._id.equals(batchId));
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found');

    const sem = batch.semlists.find((s) => (s as any)._id.equals(semId));
    if (!sem) return handleErrorResponse(res, 404, 'Semester not found');

    const namelist = sem.namelist;

    const maxMark = structure.reduce(
      (sum, part) => sum + (part.maxMark ?? 0) * (part.questions?.length ?? 0),
      0
    );

    const populatedStudents = namelist.map((student) => ({
      rollno: student.rollno,
      name: student.name,
      totalMark: 0,
      typemark: new Map(),
      parts: structure,
    }));

    const newPTList = new PtList({
      title,
      maxMark,
      structure,
      students: populatedStudents,
    });

    sem.ptlists.push(newPTList);
    await user.save();

    return res
      .status(201)
      .json({ message: 'PT list created successfully', ptList: newPTList });
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Error creating PT list');
  }
};

interface Question {
  number: number;
  option: string;
  mark: number;
}

interface ScorePart {
  title: string;
  questions: Question[];
}

// Update student scores
export const updateStudentScore = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const {
      semId,
      ptId,
      stdId,
      scores,
      batchId,
    }: {
      semId: string;
      ptId: string;
      stdId: string;
      scores: ScorePart[];
      batchId: string;
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(ptId) ||
      !scores ||
      !Array.isArray(scores)
    ) {
      return handleErrorResponse(res, 400, 'Invalid input data');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found');

    const batch = user.batches.find((b) => (b as any)._id.equals(batchId));
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found');

    const sem = batch.semlists.find((s) => (s as any)._id.equals(semId));
    if (!sem) return handleErrorResponse(res, 404, 'Semester not found');

    const ptList = sem.ptlists.find((pt) => (pt as any)._id.equals(ptId));
    if (!ptList) return handleErrorResponse(res, 404, 'PT list not found');

    const student = ptList.students.find((s) => s.rollno === stdId);
    if (!student) return handleErrorResponse(res, 404, 'Student not found');
    let totalMark = 0;
    let typeMark = new Map<string, number>();

    scores.forEach(({ title, questions }: ScorePart) => {
      let partTotal = 0;
      questions.forEach(({ number, option, mark }) => {
        partTotal += mark;
        typeMark.set(option, (typeMark.get(option) || 0) + mark);
      });

      const part = student.parts.find((p) => p.title === title);
      if (part) {
        part.questions.forEach((q) => {
          const newMark = questions.find((qn) => qn.number === q.number)?.mark;
          if (newMark !== undefined) {
            q.mark = newMark;
          }
        });
      }

      totalMark += partTotal;
    });

    student.totalMark = totalMark;
    student.typemark = typeMark;

    await user.save();

    return res
      .status(200)
      .json({ message: 'Student scores updated successfully', ptList });
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Error updating student scores');
  }
};

// Delete PT list
export const deletePT = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { ptId, batchId, semId } = req.body;

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found');

    const batch = user.batches.find((b) => (b as any)._id.equals(batchId));
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found');

    const sem = batch.semlists.find((s) => (s as any)._id.equals(semId));
    if (!sem) return handleErrorResponse(res, 404, 'Semester not found');

    sem.ptlists = sem.ptlists.filter((pt) => !(pt as any)._id.equals(ptId));
    await user.save();

    return res.status(200).json({ message: 'PT list deleted successfully' });
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Error deleting PT list');
  }
};
