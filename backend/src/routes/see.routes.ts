import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Namelist } from '../models/namelist.model';
import { SEE } from '../models/see.model';
import { User } from '../models/user.model';

const router = express.Router();

const handleErrorResponse = (
  res: Response,
  status: number,
  message: string
) => {
  return res.status(status).json({ message });
};

const verifyUserOwnership = async (
  userId: string,
  listId: string,
  listType: string
) => {
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

  if (!user[listType].includes(listId)) {
    throw new Error('List not associated with the user.');
  }
};

// GET route to retrieve all SAA list titles and IDs for a user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return handleErrorResponse(res, 400, 'Invalid user ID');
    }

    const user = await User.findById(userId).populate('saalists', 'title _id');

    if (!user) {
      return handleErrorResponse(res, 404, 'User not found');
    }

    const saalists = user.saalists;
    return res.status(200).json(saalists);
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving SAA lists',
      error: (error as Error).message,
    });
  }
});

// GET route to retrieve student details for a specific SAA list
router.get('/saalist/:saaId/:userId', async (req: Request, res: Response) => {
  try {
    const { userId, saaId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(saaId)
    ) {
      return handleErrorResponse(res, 400, 'Invalid user ID or SAA list ID');
    }

    await verifyUserOwnership(userId, saaId, 'saalists');

    const saaList = await SEE.findById(saaId);

    if (!saaList) {
      return handleErrorResponse(res, 404, 'SAA list not found');
    }

    return res.status(200).json(saaList);
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving student details',
      error: (error as Error).message,
    });
  }
});

// POST route to create a new SAA list
router.post('/create/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { title, courses, namelistId } = req.body;

    if (
      !title ||
      !courses ||
      !Array.isArray(courses) ||
      !namelistId ||
      !userId
    ) {
      return handleErrorResponse(res, 400, 'Invalid input data');
    }

    await verifyUserOwnership(userId, namelistId, 'namelists');

    const nameList = await Namelist.findById(namelistId);
    if (!nameList) {
      return handleErrorResponse(res, 404, 'NameList not found');
    }

    const populatedStudents = nameList.students.map((student) => {
      const scores: { [key: string]: number } = {};
      courses.forEach((course) => {
        scores[course] = 0;
      });
      return {
        rollno: student.rollno,
        name: student.name,
        scores,
      };
    });

    const newSAAList = new SEE({
      title,
      courses,
      students: populatedStudents,
    });

    const user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 404, 'User not found');
    }

    const savedSAAList = await newSAAList.save();
    user.saalists.push(savedSAAList._id);
    await user.save();

    return res.status(201).json({
      message: 'SAA list created successfully',
      saaList: savedSAAList,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error creating SAA list',
      error: (error as Error).message,
    });
  }
});

// PUT route to update student scores
router.put('/score/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { saaId, rollno, scores } = req.body;

    if (!saaId || !userId || !rollno || !scores || typeof scores !== 'object') {
      return handleErrorResponse(res, 400, 'Invalid input data');
    }

    await verifyUserOwnership(userId, saaId, 'saalists');

    const saaList = await SEE.findById(saaId);
    if (!saaList) {
      return handleErrorResponse(res, 404, 'SAA list not found');
    }

    const student = saaList.students.find(
      (student) => student.rollno === rollno
    );
    if (!student) {
      return handleErrorResponse(res, 404, 'Student not found');
    }

    for (let course in scores) {
      if (student.scores.has(course)) {
        student.scores.set(course, scores[course]);
      }
    }

    const updatedSAAList = await saaList.save();
    return res.status(200).json({
      message: 'Student scores updated successfully',
      saaList: updatedSAAList,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating student scores',
      error: (error as Error).message,
    });
  }
});

// DELETE route to delete an SAA list
router.delete('/delete/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { saaId } = req.body;

    if (!saaId || !userId) {
      return handleErrorResponse(res, 400, 'Invalid input data');
    }

    await verifyUserOwnership(userId, saaId, 'saalists');

    const saaList = await SEE.findById(saaId);
    if (!saaList) {
      return handleErrorResponse(res, 404, 'SAA list not found');
    }

    await saaList.remove();

    const user = await User.findById(userId);
    if (!user) {
      return handleErrorResponse(res, 404, 'User not found');
    }

    user.saalists = user.saalists.filter(
      (listId) => listId.toString() !== saaId
    );
    await user.save();

    return res.status(200).json({ message: 'SAA list deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting SAA list',
      error: (error as Error).message,
    });
  }
});

export default router;
