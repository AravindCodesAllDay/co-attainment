import { Schema, Document } from 'mongoose';

export interface INameStudent extends Document {
  registration_no: number;
  rollno: string;
  name: string;
}

const nameStudentSchema = new Schema<INameStudent>({
  registration_no: { type: Number, required: true },
  rollno: { type: String, required: true },
  name: { type: String, required: true },
});

export { nameStudentSchema };
