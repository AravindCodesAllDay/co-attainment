import mongoose, { Schema, Document, Model } from 'mongoose';
import { nameStudentSchema, INameStudent } from './nameStudentModel';

export interface INamelist extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  students: INameStudent[];
}

const namelistSchema = new Schema<INamelist>(
  {
    title: { type: String, required: true },
    students: { type: [nameStudentSchema] },
  },
  { timestamps: true }
);

const Namelist: Model<INamelist> = mongoose.model<INamelist>(
  'Namelist',
  namelistSchema
);
export { Namelist };
