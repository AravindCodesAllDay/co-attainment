import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
// import UserRoutes from './routes/userRoutes';
// import BatchRoutes from './routes/batchRoutes';
// import SemesterRoutes from './routes/semesterRoutes';
// import NamelistRoutes from './routes/namelistRoutes';
// import CourseRoutes from './routes/courseRoutes';
// import PtRoutes from './routes/ptRoutes';
// import SeeRoutes from './routes/seeRoutes';
// import CoTypeRoutes from './routes/cotypeRoutes';

const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use('/user', UserRoutes);
// app.use('/batch', BatchRoutes);
// app.use('/semester', SemesterRoutes);
// app.use('/namelist', NamelistRoutes);
// app.use('/course', CourseRoutes);
// app.use('/pt', PtRoutes);
// app.use('/see', SeeRoutes);
// app.use('/cotype', CoTypeRoutes);

const CONNECTION: string = process.env.CONNECTION as string;

if (!CONNECTION) {
  console.error('Connection string is not provided.');
  process.exit(1);
}

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the CO-attainment API');
});

const start = async () => {
  try {
    await mongoose.connect(CONNECTION);

    if (!process.env.VERCEL) {
      app.listen(3030, () => {
        console.log(`App listening on port 3030`);
      });
    }
  } catch (error) {
    console.error('Error during startup:', error);
    process.exit(1);
  }

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB disconnected through app termination');
    process.exit(0);
  });
};

start();
