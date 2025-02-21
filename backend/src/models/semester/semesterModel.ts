import mongoose, { Schema, Document, Model } from 'mongoose';
import { CoList, ICoList } from '../course/courselModel';
import { PtList, IPtList } from '../pt/ptListModel';
import { See, ISee } from '../see/seeModel';
import { INamelist, Namelist } from '../namelist/namelistModel';

export interface ISemester extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  namelist: INamelist[];
  courselists: ICoList[];
  ptlists: IPtList[];
  seelists: ISee[];
}

const semesterSchema = new Schema<ISemester>({
  title: { type: String, required: true },
  namelist: [Namelist.schema],
  courselists: [CoList.schema],
  ptlists: [PtList.schema],
  seelists: [See.schema],
});

const Semester: Model<ISemester> = mongoose.model<ISemester>(
  'Semester',
  semesterSchema
);
export { Semester };
