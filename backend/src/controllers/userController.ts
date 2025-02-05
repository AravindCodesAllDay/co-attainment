import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user/userModel';

const SECRET_KEY = process.env.JWT_SECRET as string;

interface JwtPayload {
  id: string;
}

// Function to verify JWT token and return userId
export async function verifyToken(authHeader?: string): Promise<string> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization header is missing or invalid');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new Error('Token is required');
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    return decoded.id;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// API to verify JWT token
export async function verifyTokenApi(
  req: Request,
  res: Response
): Promise<Response> {
  const authHeader = req.headers.authorization;

  try {
    const userId = await verifyToken(authHeader);
    return res.status(200).json({ userId });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return res.status(401).json({ error: errorMessage });
  }
}

// Function to handle login or create a new user and issue a JWT token
export const loginOrCreateUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const newUser = new User({ email });
      user = await newUser.save();
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, {
      expiresIn: '24h',
    });

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({
      message: 'Error logging in',
      error: (error as Error).message,
    });
  }
};
