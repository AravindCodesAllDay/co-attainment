import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user/userModel';
import { verifyToken } from './userController';
import { Namelist } from '../models/namelist/namelistModel';

const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({ message });
};

export const getNamelist = async (req: Request, res: Response) => {
  try {
    const { batchId, semId } = req.params;
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(batchId) ||
      !mongoose.isValidObjectId(semId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid user ID or batch ID.');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const batch = user.batches.find((b) => b._id.toString() === batchId);
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');
    const sem = batch.semlists.find((b) => b._id.toString() === semId);
    if (!sem) return handleErrorResponse(res, 404, 'semester not found.');
    return res.status(200).json(sem.namelist);
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

export const addStudents2Namelist = async (req: Request, res: Response) => {
  try {
    const { batchId, semId, studentDetails } = req.body;
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(batchId) ||
      !mongoose.isValidObjectId(semId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid user ID or batch ID.');
    }
    if (!Array.isArray(studentDetails) || studentDetails.length === 0) {
      return handleErrorResponse(
        res,
        400,
        'Student details must be a non-empty array.'
      );
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const batch = user.batches.find((b) => b._id.toString() === batchId);
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');
    const sem = batch.semlists.find((b) => b._id.toString() === semId);
    if (!sem) return handleErrorResponse(res, 404, 'semester not found.');

    studentDetails.forEach((student) => {
      const newStudent = new Namelist({
        registration_no: student.registration_no,
        rollno: student.rollno,
        name: student.name,
      });
      sem.namelist.push(newStudent);
    });

    await user.save();
    return res.status(200).json({ message: 'Students added successfully.' });
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

export const editStudentNamelist = async (req: Request, res: Response) => {
  try {
    const { batchId, semId, studentId, studentDetail } = req.body;
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(batchId) ||
      !mongoose.isValidObjectId(semId) ||
      !mongoose.isValidObjectId(studentId)
    ) {
      return handleErrorResponse(
        res,
        400,
        'Invalid user ID, batch ID, or student ID.'
      );
    }

    if (!studentDetail) {
      return handleErrorResponse(res, 400, 'Student details must be provided.');
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const batch = user.batches.find((b) => b._id.toString() === batchId);
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');

    const sem = batch.semlists.find((b) => b._id.toString() === semId);
    if (!sem) return handleErrorResponse(res, 404, 'semester not found.');
    const student = sem.namelist.find(
      (s) => (s._id as mongoose.Types.ObjectId).toString() === studentId
    );
    if (!student) return handleErrorResponse(res, 404, 'Student not found.');

    student.rollno = studentDetail.rollno;
    student.registration_no = studentDetail.registration_no;
    student.name = studentDetail.name;

    await user.save();
    return res
      .status(200)
      .json({ message: 'Student details updated successfully.' });
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

export const deleteStudentNamelist = async (req: Request, res: Response) => {
  try {
    const { batchId, semId, studentId } = req.body;
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(batchId) ||
      !mongoose.isValidObjectId(semId) ||
      !mongoose.isValidObjectId(studentId)
    ) {
      return handleErrorResponse(
        res,
        400,
        'Invalid user ID, batch ID, or student ID.'
      );
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const batch = user.batches.find((b) => b._id.toString() === batchId);
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');

    const sem = batch.semlists.find((b) => b._id.toString() === semId);
    if (!sem) return handleErrorResponse(res, 404, 'semester not found.');
    const studentIndex = sem.namelist.findIndex(
      (s) => (s._id as mongoose.Types.ObjectId).toString() === studentId
    );

    if (studentIndex === -1)
      return handleErrorResponse(res, 404, 'Student not found.');

    sem.namelist.splice(studentIndex, 1);
    await user.save();

    return res.status(200).json({ message: 'Student deleted successfully.' });
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};
