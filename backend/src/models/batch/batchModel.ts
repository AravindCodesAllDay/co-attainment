import mongoose, { Schema, Document, Model } from 'mongoose';
import { Semester, ISemester } from '../semester/semesterModel';

export interface IBatch extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  semlists: ISemester[];
}

const batchSchema = new Schema<IBatch>({
  title: { type: String, required: true },
  semlists: [Semester.schema],
});

const Batch: Model<IBatch> = mongoose.model<IBatch>('Batch', batchSchema);
export { Batch };
