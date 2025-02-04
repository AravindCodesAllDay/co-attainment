import mongoose, { Schema, Document, Model } from 'mongoose';
import { Namelist, INamelist } from '../namelist/namelistModel';
import { Semester, ISemester } from '../semester/semesterModel';

export interface IBatch extends Document {
  title: string;
  namelists: INamelist[];
  semlists: ISemester[];
}

const batchSchema = new Schema<IBatch>({
  title: { type: String, required: true },
  namelists: [Namelist.schema],
  semlists: [Semester.schema],
});

const Batch: Model<IBatch> = mongoose.model<IBatch>('Batch', batchSchema);
export { Batch };
