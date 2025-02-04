import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { User } from '../models/user/userModel';

// Initialize router
const router = express.Router();

// Middleware to verify JWT token
// const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
//   const token = req.header('Authorization');

//   if (!token) {
//     return res.status(401).json({ message: 'Unauthorized: No token provided' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
//       id: string;
//     };
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Unauthorized: Invalid token' });
//   }
// };

// Protected route example
// router.get('/protected', verifyToken, (req: Request, res: Response) => {
//   res
//     .status(200)
//     .json({ message: 'Access to protected route granted', user: req.user });
// });

// Login route or create a new user
router.post('/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const newUser = new User({ email });
      user = await newUser.save();
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    res.status(200).send({
      token: token,
      userId: user._id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error logging in', error: (error as Error).message });
  }
});

export default router;
