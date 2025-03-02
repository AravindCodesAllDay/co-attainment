import mongoose, { Model, Document } from 'mongoose';

export interface ISee extends Document {
  _id: mongoose.Types.ObjectId;
  rollno: string;
  name: string;
  scores: Map<string, number>;
}

const seeSchema = new mongoose.Schema<ISee>(
  {
    rollno: { type: String, required: true },
    name: { type: String, required: true },
    scores: { type: Map, of: Number },
  },
  { timestamps: true }
);

const See: Model<ISee> = mongoose.model<ISee>('See', seeSchema);
export { See };
