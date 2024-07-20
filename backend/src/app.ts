import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
// import PtRoutes from "./routes/pt.routes";
// import SeeRoutes from "./routes/see.routes";
// import CourseRoutes from "./routes/course.routes";
// import NamelistRoutes from "./routes/namelist.routes";
import CoTypeRoutes from './routes/cotype.routes';
import BunSemRoutes from './routes/bunsem.routes';
import UserRoutes from './routes/user.routes';

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use("/pt", PtRoutes);
// app.use("/see", SeeRoutes);
// app.use("/course", CourseRoutes);
// app.use("/namelist", NamelistRoutes);
app.use('/cotype', CoTypeRoutes);
app.use('/bunsem', BunSemRoutes);
app.use('/user', UserRoutes);

// Load environment variables
dotenv.config();

const PORT: number = parseInt(process.env.PORT || '3000', 10);
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
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });
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
