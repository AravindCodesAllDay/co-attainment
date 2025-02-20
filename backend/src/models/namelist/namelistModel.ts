import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INamelist extends Document {
  registration_no: number;
  rollno: string;
  name: string;
}

const namelistSchema = new Schema<INamelist>(
  {
    registration_no: { type: Number, required: true },
    rollno: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const Namelist: Model<INamelist> = mongoose.model<INamelist>(
  'Namelist',
  namelistSchema
);
export { Namelist };
