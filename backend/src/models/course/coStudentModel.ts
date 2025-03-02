import { Schema, Document } from 'mongoose';

export interface ICoStudent extends Document {
  rollno: string;
  name: string;
  average: number;
  scores: Map<string, number>;
}

const coStudentSchema = new Schema<ICoStudent>({
  rollno: { type: String, required: true },
  name: { type: String, required: true },
  average: { type: Number, default: 0 },
  scores: { type: Map, of: Number, default: {} },
});

export { coStudentSchema };
