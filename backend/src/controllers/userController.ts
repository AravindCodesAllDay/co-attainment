import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user/userModel';

// Function to handle login or create a new user and issue a JWT token
export const loginOrCreateUser = async (req: Request, res: Response) => {
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
    res.status(500).json({
      message: 'Error logging in',
      error: (error as Error).message,
    });
  }
};
