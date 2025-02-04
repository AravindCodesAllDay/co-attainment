import mongoose, { Schema, Document, Model } from 'mongoose';
import { Namelist, INamelist } from '../namelist/namelistModel';
import { Sem, ISem } from '../sem/semModel';

export interface IBundle extends Document {
  title: string;
  namelists: INamelist[];
  semlists: ISem[];
}

const bundleSchema = new Schema<IBundle>({
  title: { type: String, required: true },
  namelists: [Namelist.schema],
  semlists: [Sem.schema],
});

const Bundle: Model<IBundle> = mongoose.model<IBundle>('Bundle', bundleSchema);
export { Bundle };
