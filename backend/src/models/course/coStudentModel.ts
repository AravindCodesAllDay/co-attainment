import { Schema, Document } from 'mongoose';

export interface ICoStudent extends Document {
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

export { coStudentSchema };
