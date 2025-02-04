import { Schema, Document } from 'mongoose';

export interface ISeeStudent extends Document {
  rollno: string;
  name: string;
  scores: Map<string, number>;
}

const seeStudentSchema = new Schema<ISeeStudent>({
  rollno: { type: String, required: true },
  name: { type: String, required: true },
  scores: { type: Map, of: Number, default: {} },
});

export { seeStudentSchema };
