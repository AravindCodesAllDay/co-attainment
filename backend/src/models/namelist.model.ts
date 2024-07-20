import mongoose, { Schema, Document, Model } from 'mongoose';

interface INameStudent extends Document {
  registration_no: number;
  rollno: string;
  name: string;
}

const nameStudentSchema = new Schema<INameStudent>({
  registration_no: { type: Number, required: true, unique: true },
  rollno: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

interface INamelist extends Document {
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

const Namelist: Model<INamelist> = mongoose.model('Namelist', namelistSchema);
export { Namelist };
