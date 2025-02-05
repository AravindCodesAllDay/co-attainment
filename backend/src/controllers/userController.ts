import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

import { User } from '../models/user/userModel';

const SECRET_KEY = process.env.JWT_SECRET as string;

if (!SECRET_KEY) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

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
    console.error('JWT Verification Error:', error);
    throw new Error('Invalid or expired token');
  }
}

// API to verify JWT token
export async function verifyTokenApi(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const authHeader = req.headers.authorization;

    await verifyToken(authHeader);

    return res.status(200).json({ message: 'token Valid' });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

const isValidGmail = (email: string): boolean => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return emailPattern.test(email);
};

// Function to handle login or create a new user and issue a JWT token
export const loginOrCreateUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    console.log('loginOrCreateUser called with body:', req.body);

    const { email } = req.body;

    if (!email || !isValidGmail(email)) {
      return res.status(400).json({
        message: 'Invalid email format. Please use a valid Gmail address.',
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      console.log('User not found, creating new user...');
      const newUser = new User({ email });
      user = await newUser.save();
    } else {
      console.log('User found:', user);
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '24h' });
    return res.status(200).json({ token: `Bearer ${token}` });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({
      message: 'Error logging in',
      error: (error as Error).message,
    });
  }
};
