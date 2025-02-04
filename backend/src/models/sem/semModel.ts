import mongoose, { Schema, Document, Model } from 'mongoose';
import { CoList, ICoList } from '../course/coListModel';
import { PtList, IPtList } from '../pt/ptListModel';
import { See, ISee } from '../see/seeModel';

export interface ISem extends Document {
  title: string;
  courselists: ICoList[];
  ptlists: IPtList[];
  seelists: ISee[];
}

const semSchema = new Schema<ISem>({
  title: { type: String, required: true },
  courselists: [CoList.schema],
  ptlists: [PtList.schema],
  seelists: [See.schema],
});

const Sem: Model<ISem> = mongoose.model<ISem>('Semester', semSchema);
export { Sem };
