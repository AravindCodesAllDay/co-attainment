import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User, INamelist, Namelist } from '../models/user.model';

const router = express.Router();

// Utility function to handle error responses
const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({ message });
};

// Get all namelists of a specific bundle
router.get('/:bundleId/:userId', async (req: Request, res: Response) => {
  try {
    const { userId, bundleId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId)
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

    const namelists = bundle.namelists.map((namelist) => ({
      namelistId: namelist._id,
      title: namelist.title,
    }));

    return res.status(200).json(namelists);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

// Create a new namelist in a specific bundle
router.post('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { title, bundleId } = req.body;

    if (
      !title ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(bundleId)
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

    const bundle = user.bundles.find((bundle) =>
      (bundle as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
        bundleId
      )
    );

    if (!bundle) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    const newNamelist = new Namelist({
      title,
      students: [],
    });

    bundle.namelists.push(newNamelist);

    await user.save();

    return res.status(201).json(newNamelist);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

// Delete a namelist
router.delete('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { namelistId, bundleId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(namelistId) ||
      !mongoose.Types.ObjectId.isValid(bundleId)
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

    const bundle = user.bundles.find((bundle) =>
      (bundle as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
        bundleId
      )
    );

    if (!bundle) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    const namelistIndex = (
      bundle as unknown as { namelists: mongoose.Types.ObjectId[] }
    ).namelists.findIndex((namelist) => namelist._id.equals(namelistId));

    if (namelistIndex === -1) {
      return handleErrorResponse(res, 404, 'Namelist not found.');
    }

    (
      bundle as unknown as { namelists: mongoose.Types.ObjectId[] }
    ).namelists.splice(namelistIndex, 1);

    await user.save();

    return res.status(200).json({ message: 'Namelist deleted successfully.' });
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

// Get students in a namelist
router.get(
  '/student/:bundleId/:namelistId/:userId',
  async (req: Request, res: Response) => {
    try {
      const { userId, bundleId, namelistId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(namelistId) ||
        !mongoose.Types.ObjectId.isValid(bundleId)
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

      const bundle = user.bundles.find((bundle) =>
        (bundle as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
          bundleId
        )
      );

      if (!bundle) {
        return handleErrorResponse(res, 404, 'Bundle not found.');
      }

      const namelist = bundle.namelists.find((namelist) =>
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
  }
);

// Add a student to a namelist
router.post('/student/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { namelistId, bundleId, studentDetail } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(namelistId) ||
      !mongoose.Types.ObjectId.isValid(bundleId) ||
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

    const bundle = user.bundles.find((bundle) =>
      (bundle as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
        bundleId
      )
    );

    if (!bundle) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    const namelist = bundle.namelists.find((namelist) =>
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
});

// Update student details in a namelist
router.put('/student/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { namelistId, bundleId, studentId, studentDetail } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(namelistId) ||
      !mongoose.Types.ObjectId.isValid(bundleId) ||
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

    const bundle = user.bundles.find((bundle) =>
      (bundle as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
        bundleId
      )
    );

    if (!bundle) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    const namelist = bundle.namelists.find((namelist) =>
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
});

// Delete a student from a namelist
router.delete('/student/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { namelistId, bundleId, studentId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(namelistId) ||
      !mongoose.Types.ObjectId.isValid(bundleId) ||
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

    const bundle = user.bundles.find((bundle) =>
      (bundle as unknown as { _id: mongoose.Types.ObjectId })._id.equals(
        bundleId
      )
    );

    if (!bundle) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    const namelist = bundle.namelists.find((namelist) =>
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
});

export default router;
