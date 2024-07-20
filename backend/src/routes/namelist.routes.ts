import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Namelist } from '../models/namelist.model';

const router = express.Router();

// Utility function to handle error responses
const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({ message });
};

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

    const bundle = user.bundles.id(bundleId);

    if (!bundle) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    const namelist = await Namelist.create({ title });

    bundle.namelists.push(namelist);

    await user.save();

    return res.status(201).json(namelist);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

// Get all namelists of a specific bundle
router.get('/:userId/:bundleId', async (req: Request, res: Response) => {
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

    const bundle = user.bundles.id(bundleId);

    if (!bundle) {
      return handleErrorResponse(res, 404, 'Bundle not found.');
    }

    return res.status(200).json(bundle.namelists);
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

// Delete a namelist
router.delete('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { namelistId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(namelistId)
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

    const namelist = await Namelist.findByIdAndDelete(namelistId);

    if (!namelist) {
      return handleErrorResponse(res, 404, 'Namelist not found.');
    }

    user.bundles.forEach((bundle) => {
      const index = bundle.namelists.indexOf(namelistId);
      if (index !== -1) {
        bundle.namelists.splice(index, 1);
      }
    });

    await user.save();

    return res.status(200).json({ message: 'Namelist deleted successfully.' });
  } catch (error) {
    console.error((error as Error).message);
    return handleErrorResponse(res, 500, 'Internal Server Error');
  }
});

// The following routes are commented out. Uncomment and type if needed.
// Add a student to a namelist
// router.post('/student/:userId', async (req: Request, res: Response) => {
//   try {
//     const { userId } = req.params;
//     const { namelistId, studentDetail } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(namelistId) || !studentDetail) {
//       return handleErrorResponse(res, 400, 'All required fields must be provided.');
//     }

//     const namelist = await Namelist.findById(namelistId);

//     if (!namelist) {
//       return handleErrorResponse(res, 404, 'Namelist not found.');
//     }

//     namelist.students.push(studentDetail);
//     await namelist.save();

//     return res.status(200).json(namelist);
//   } catch (error) {
//     console.error((error as Error).message);
//     return handleErrorResponse(res, 500, 'Internal Server Error');
//   }
// });

// Get students in a namelist
// router.get('/student/:namelistId/:userId', async (req: Request, res: Response) => {
//   try {
//     const { userId, namelistId } = req.params;

//     const namelist = await Namelist.findById(namelistId);

//     if (!namelist) {
//       return handleErrorResponse(res, 404, 'Namelist not found.');
//     }

//     return res.status(200).json(namelist.students);
//   } catch (error) {
//     console.error((error as Error).message);
//     return handleErrorResponse(res, 500, 'Internal Server Error');
//   }
// });

// Update student details in a namelist
// router.put('/student/:userId', async (req: Request, res: Response) => {
//   try {
//     const { userId } = req.params;
//     const { namelistId, studentId, studentDetail } = req.body;

//     if (!userId || !namelistId || !studentDetail || !studentId) {
//       return handleErrorResponse(res, 400, 'All required fields must be provided.');
//     }

//     const namelist = await Namelist.findById(namelistId);

//     if (!namelist) {
//       return handleErrorResponse(res, 404, 'Namelist not found.');
//     }

//     const student = namelist.students.id(studentId);
//     if (!student) {
//       return handleErrorResponse(res, 404, 'Student not found in the namelist.');
//     }

//     student.rollno = studentDetail.rollno;
//     student.name = studentDetail.name;

//     await namelist.save();

//     return res.status(200).json({ message: 'Student details updated successfully.' });
//   } catch (error) {
//     console.error((error as Error).message);
//     return handleErrorResponse(res, 500, 'Internal Server Error');
//   }
// });

// Delete a student from a namelist
// router.delete('/student/:userId', async (req: Request, res: Response) => {
//   try {
//     const { userId } = req.params;
//     const { namelistId, studentId } = req.body;

//     if (!userId || !namelistId || !studentId) {
//       return handleErrorResponse(res, 400, 'All required fields must be provided.');
//     }

//     const namelist = await Namelist.findById(namelistId);

//     if (!namelist) {
//       return handleErrorResponse(res, 404, 'Namelist not found.');
//     }

//     const studentIndex = namelist.students.findIndex(student => student._id.toString() === studentId);

//     if (studentIndex === -1) {
//       return handleErrorResponse(res, 404, 'Student not found in the namelist.');
//     }

//     namelist.students.splice(studentIndex, 1);

//     await namelist.save();

//     return res.status(200).json({ message: 'Student deleted successfully.' });
//   } catch (error) {
//     console.error((error as Error).message);
//     return handleErrorResponse(res, 500, 'Internal Server Error');
//   }
// });

export default router;
