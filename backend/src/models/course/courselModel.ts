import mongoose, { Schema, Document, Model } from 'mongoose';
import { coStudentSchema, ICoStudent } from './coStudentModel';

export interface ICoList extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  average: number;
  rows: string[];
  students: ICoStudent[];
}

const coListSchema = new Schema<ICoList>(
  {
    title: { type: String, required: true },
    average: { type: Number, default: 0 },
    rows: { type: [String], required: true },
    students: { type: [coStudentSchema] },
  },
  { timestamps: true }
);

coListSchema.pre('save', function (next) {
  const students = this.get('students') as ICoStudent[];
  if (students.length > 0) {
    const totalAverageScore = students.reduce(
      (sum, student) => sum + student.averageScore,
      0
    );
    this.set('average', totalAverageScore / students.length);
  } else {
    this.set('average', 0);
  }
  next();
});

const CoList: Model<ICoList> = mongoose.model<ICoList>('CoList', coListSchema);
export { CoList };
