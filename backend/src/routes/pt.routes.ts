import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User, Namelist, PtList } from '../models/user.model';

const router = express.Router();

// Helper function to calculate average mark
const calculateAverageMark = (students: { totalMark: number }[]): number => {
  const totalMarks = students.reduce(
    (sum, student) => sum + student.totalMark,
    0
  );
  return students.length ? totalMarks / students.length : 0;
};

// Middleware to verify user ownership of PtList
const verifyUserOwnership = async (
  userId: string,
  ptListId: string
): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.ptlists.includes(ptListId)) {
    throw new Error('User does not have access to this PT list');
  }
};

// GET route to retrieve all PtList titles and IDs for a user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send('Invalid user ID');
    }

    const user = await User.findById(userId).populate('ptlists', 'title _id');

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.status(200).json(user.ptlists);
  } catch (err) {
    console.error(err);
    res.status(500).send((err as Error).message);
  }
});

// GET route to retrieve student details for a specific PtList
router.get('/ptlist/:ptListId/:userId', async (req: Request, res: Response) => {
  try {
    const { userId, ptListId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(ptListId)
    ) {
      return res.status(400).send('Invalid user ID or PtList ID');
    }

    await verifyUserOwnership(userId, ptListId);

    const ptList = await PtList.findById(ptListId);

    if (!ptList) {
      return res.status(404).send('PtList not found');
    }

    res.status(200).json(ptList);
  } catch (err) {
    console.error(err);
    res.status(500).send((err as Error).message);
  }
});

// Route to create a table of students from the NameList with user-defined parts
router.post('/create/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { nameListId, title, parts, maxMark } = req.body;

    if (!nameListId || !title || !parts || !maxMark || !userId) {
      return res.status(400).send('Missing required fields');
    }

    const nameList = await Namelist.findById(nameListId);
    if (!nameList) {
      return res.status(404).send('NameList not found');
    }

    // Initialize mark and typemark for each question
    const initializedParts = parts.map(
      (part: {
        title: string;
        questions: { option: string; mark: number }[];
      }) => ({
        ...part,
        questions: part.questions.map((question: { option: string }) => ({
          ...question,
          mark: 0,
        })),
      })
    );

    const students = nameList.students.map(
      (student: { rollno: string; name: string }) => {
        const typemark = new Map<string, number>();
        parts.forEach((part: { questions: { option: string }[] }) => {
          part.questions.forEach((question: { option: string }) => {
            typemark.set(question.option, 0);
          });
        });

        return {
          rollno: student.rollno,
          name: student.name,
          totalMark: 0,
          typemark: typemark,
          parts: initializedParts,
        };
      }
    );

    const ptList = new PtList({
      title,
      students,
      maxMark,
      structure: parts,
    });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await ptList.save();
    user.ptlists.push(ptList._id);

    await user.save();

    res.status(201).send(ptList);
  } catch (err) {
    console.error(err);
    res.status(500).send((err as Error).message);
  }
});

// Route to enter marks for multiple questions in multiple parts
router.put('/score/:userId', async (req: Request, res: Response) => {
  try {
    const { ptListId, studentId, parts } = req.body;
    const { userId } = req.params;

    if (!ptListId || !userId || !studentId || !Array.isArray(parts)) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    await verifyUserOwnership(userId, ptListId);

    const ptList = await PtList.findById(ptListId);
    if (!ptList) {
      return res.status(404).send('PtList not found');
    }

    const student = ptList.students.id(studentId);
    if (!student) {
      return res.status(404).send('Student not found');
    }

    let totalMarkAdjustment = 0;
    let typemarkAdjustment: { [key: string]: number } = {};

    parts.forEach(
      ({
        title,
        questions,
      }: {
        title: string;
        questions: { number: number; mark: number }[];
      }) => {
        let part = student.parts.find(
          (p: { title: string }) => p.title === title
        );
        if (!part) {
          throw new Error(`Part title ${title} not found`);
        }

        questions.forEach(
          ({ number, mark }: { number: number; mark: number }) => {
            let question = part.questions.find(
              (q: { number: number }) => q.number === number
            );
            if (!question) {
              throw new Error(`Question number ${number} not found`);
            }

            const previousMark = question.mark;
            question.mark = mark;

            totalMarkAdjustment += mark - previousMark;
            const questionType = question.type;
            if (!typemarkAdjustment[questionType]) {
              typemarkAdjustment[questionType] = 0;
            }
            typemarkAdjustment[questionType] += mark - previousMark;
          }
        );
      }
    );

    // Update total mark and type mark
    student.totalMark += totalMarkAdjustment;
    for (const [type, adjustment] of Object.entries(typemarkAdjustment)) {
      student.typemark.set(
        type,
        (student.typemark.get(type) || 0) + adjustment
      );
    }

    // Recalculate the average mark for the ptList
    ptList.averagemark = calculateAverageMark(ptList.students);

    await ptList.save();
    res.status(200).send(ptList);
  } catch (err) {
    console.error(err);
    res.status(500).send((err as Error).message);
  }
});

// Route to delete a PtList
router.delete('/delete/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { ptListId } = req.body;

    if (!ptListId || !userId) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    await verifyUserOwnership(userId, ptListId);

    const ptList = await PtList.findByIdAndDelete(ptListId);

    if (!ptList) {
      return res.status(404).send('PtList not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.ptlists = user.ptlists.filter(
      (listId) => listId.toString() !== ptListId
    );

    await user.save();

    res.status(200).send({ message: 'PtList deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send((err as Error).message);
  }
});

export default router;
