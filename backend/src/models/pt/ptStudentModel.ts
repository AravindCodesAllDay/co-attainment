import { Schema, Document } from 'mongoose';
import { ptPartSchema, IPtPart } from './ptPartModel';

export interface IPtStudent extends Document {
  rollno: string;
  name: string;
  totalMark: number;
  typemark: Map<string, number>;
  parts: IPtPart[];
}

const ptStudentSchema = new Schema<IPtStudent>({
  rollno: { type: String, required: true },
  name: { type: String, required: true },
  totalMark: { type: Number, default: 0 },
  typemark: { type: Map, of: Number, default: {} },
  parts: { type: [ptPartSchema], required: true },
});

export { ptStudentSchema };
