import mongoose, { Model, Document } from 'mongoose';
import { seeStudentSchema, ISeeStudent } from './seeStudentModel';

export interface ISee extends Document {
  title: string;
  courses: string[];
  students: ISeeStudent[];
}

const seeSchema = new mongoose.Schema<ISee>(
  {
    title: { type: String, required: true },
    courses: { type: [String] },
    students: { type: [seeStudentSchema] },
  },
  { timestamps: true }
);

const See: Model<ISee> = mongoose.model<ISee>('See', seeSchema);
export { See };
