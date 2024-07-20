import mongoose, { Schema, Document, Model } from 'mongoose';

interface ISeeStudent extends Document {
  rollno: string;
  name: string;
  scores: Map<string, number>;
}

const seeStudentSchema = new Schema<ISeeStudent>({
  rollno: { type: String, required: true },
  name: { type: String, required: true },
  scores: { type: Map, of: Number, default: {} },
});

interface ISee extends Document {
  title: string;
  courses: string[];
  students: ISeeStudent[];
}

const seeSchema = new Schema<ISee>(
  {
    title: { type: String, required: true },
    courses: { type: [String] },
    students: { type: [seeStudentSchema] },
  },
  { timestamps: true }
);

const SEE: Model<ISee> = mongoose.model<ISee>('SEE', seeSchema);
export { SEE };
