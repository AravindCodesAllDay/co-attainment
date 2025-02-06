import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Namelist } from '../models/namelist/namelistModel';
import { User } from '../models/user/userModel';
import { verifyToken } from './userController';

// Utility function to handle error responses
const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({ message });
};

// Get all namelist titles and IDs of a specific batch
export const getNamelists = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { batchId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(batchId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid user ID or batch ID.');
    }

    const user = await User.findById(userId, 'batches._id batches.namelists');

    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const batch = user.batches.find((b) =>
      (b as { _id: mongoose.Types.ObjectId })._id.equals(batchId)
    );

    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');

    const namelists = batch.namelists.map((namelist) => ({
      namelistId: namelist._id,
      title: namelist.title,
    }));

    return res.status(200).json(namelists);
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Create a new namelist in a specific batch
export const createNamelist = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { title, batchId } = req.body;

    if (
      !title ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(batchId)
    ) {
      return handleErrorResponse(
        res,
        400,
        'All required fields must be provided.'
      );
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const batch = user.batches.find((b) =>
      (b as { _id: mongoose.Types.ObjectId })._id.equals(batchId)
    );
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');

    const newNamelist = new Namelist({ title, students: [] });
    batch.namelists.push(newNamelist);

    await user.save();
    return res.status(201).json(newNamelist);
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Delete a namelist
export const deleteNamelist = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);
    const { namelistId, batchId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(namelistId) ||
      !mongoose.Types.ObjectId.isValid(batchId)
    ) {
      return handleErrorResponse(
        res,
        400,
        'All required fields must be provided.'
      );
    }

    const user = await User.findById(userId);
    if (!user) return handleErrorResponse(res, 404, 'User not found.');

    const batch = user.batches.find((b) =>
      (b as { _id: mongoose.Types.ObjectId })._id.equals(batchId)
    );
    if (!batch) return handleErrorResponse(res, 404, 'Batch not found.');

    const namelistIndex = batch.namelists.findIndex((n) =>
      (n as { _id: mongoose.Types.ObjectId })._id.equals(namelistId)
    );
    if (namelistIndex === -1)
      return handleErrorResponse(res, 404, 'Namelist not found.');

    batch.namelists.splice(namelistIndex, 1);
    await user.save();

    return res.status(200).json({ message: 'Namelist deleted successfully.' });
  } catch (error) {
    console.error(error);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Get students in a namelist
export const getStudentsNamelist = async (req: Request, res: Response) => {
  try {
    const { batchId, namelistId } = req.params;
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(namelistId) ||
      !mongoose.Types.ObjectId.isValid(batchId)
    ) {
      return handleErrorResponse(
        res,
        400,
        'Invalid user ID, bundle ID, or namelist ID.'
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }

    const batch = user.batches.find((batch) =>
      (batch as unknown as { _id: mongoose.Types.ObjectId })._id.equals(batchId)
    );

    if (!batch) {
      return handleErrorResponse(res, 404, 'Batch not found.');
    }

    const namelist = batch.namelists.find((namelist) =>
      (namelist as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
        namelistId
      )
    );

    if (!namelist) {
      return handleErrorResponse(res, 404, 'Namelist not found.');
    }

    return res.status(200).json(namelist);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

// Add a student to a namelist
export const addStudentNamelist = async (req: Request, res: Response) => {
  const { namelistId, batchId, studentDetail } = req.body;

  const authHeader = req.headers.authorization;
  const userId = await verifyToken(authHeader);
  try {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(namelistId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !studentDetail
    ) {
      return handleErrorResponse(
        res,
        400,
        'All required fields must be provided.'
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }

    const batch = user.batches.find((batch) =>
      (batch as unknown as { _id: mongoose.Types.ObjectId })._id.equals(batchId)
    );

    if (!batch) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    const namelist = batch.namelists.find((namelist) =>
      (namelist as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
        namelistId
      )
    );

    if (!namelist) {
      return handleErrorResponse(res, 404, 'Namelist not found.');
    }

    namelist.students.push(studentDetail);
    await user.save();

    return res.status(200).json(namelist);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

export const editStudentNamelist = async (req: Request, res: Response) => {
  try {
    const { namelistId, batchId, studentId, studentDetail } = req.body;
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(namelistId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !studentDetail
    ) {
      return handleErrorResponse(
        res,
        400,
        'All required fields must be provided.'
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }

    const batch = user.batches.find((batch) =>
      (batch as unknown as { _id: mongoose.Types.ObjectId })._id.equals(batchId)
    );

    if (!batch) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    const namelist = batch.namelists.find((namelist) =>
      (namelist as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
        namelistId
      )
    );

    if (!namelist) {
      return handleErrorResponse(res, 404, 'Namelist not found.');
    }

    const student = namelist.students.find((student: any) =>
      (student._id as mongoose.Types.ObjectId).equals(studentId)
    );

    if (!student) {
      return handleErrorResponse(
        res,
        404,
        'Student not found in the namelist.'
      );
    }

    student.rollno = studentDetail.rollno;
    student.registration_no = studentDetail.registration_no;
    student.name = studentDetail.name;

    await user.save();

    return res
      .status(200)
      .json({ message: 'Student details updated successfully.' });
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};

export const deleteStudentNamelist = async (req: Request, res: Response) => {
  try {
    const { namelistId, batchId, studentId } = req.body;
    const authHeader = req.headers.authorization;
    const userId = await verifyToken(authHeader);

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(namelistId) ||
      !mongoose.Types.ObjectId.isValid(batchId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return handleErrorResponse(
        res,
        400,
        'All required fields must be provided.'
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return handleErrorResponse(res, 404, 'User not found.');
    }

    const batch = user.batches.find((batch) =>
      (batch as unknown as { _id: mongoose.Types.ObjectId })._id.equals(batchId)
    );

    if (!batch) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    const namelist = batch.namelists.find((namelist) =>
      (namelist as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
        namelistId
      )
    );

    if (!namelist) {
      return handleErrorResponse(res, 404, 'Namelist not found.');
    }

    const studentIndex = namelist.students.findIndex((student: any) =>
      (student._id as mongoose.Types.ObjectId).equals(studentId)
    );

    if (studentIndex === -1) {
      return handleErrorResponse(
        res,
        404,
        'Student not found in the namelist.'
      );
    }

    namelist.students.splice(studentIndex, 1);

    await user.save();

    return res.status(200).json({ message: 'Student deleted successfully.' });
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
};
