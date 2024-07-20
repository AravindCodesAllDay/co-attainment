import mongoose, { Schema, Document, Model } from 'mongoose';

interface ICoStudent extends Document {
  rollno: string;
  name: string;
  averageScore: number;
  scores: Map<string, number>;
}

const coStudentSchema = new Schema<ICoStudent>({
  rollno: { type: String, required: true },
  name: { type: String, required: true },
  averageScore: { type: Number, default: 0 },
  scores: { type: Map, of: Number, default: {} },
});

coStudentSchema.pre('save', function (next) {
  const scores = this.get('scores') as Map<string, number>;
  if (scores.size > 0) {
    const scoreValues = Array.from(scores.values());
    const totalScore = scoreValues.reduce((sum, score) => sum + score, 0);
    this.set('averageScore', totalScore / scoreValues.length);
  } else {
    this.set('averageScore', 0);
  }
  next();
});

interface ICoList extends Document {
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

const COlist: Model<ICoList> = mongoose.model('COlist', coListSchema);
export { COlist };
