import mongoose, { Schema, Document, Model } from 'mongoose';
import { coStudentSchema, ICoStudent } from './coStudentModel';

export interface ICoList extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  structure: Map<string, number>,
  students: ICoStudent[];
}

const coListSchema = new Schema<ICoList>(
  {
    title: { type: String, required: true },
    structure: { type: Map, of: Number, required: true ,default: {}},
    students: { type: [coStudentSchema] },
  },
  { timestamps: true }
);


const CoList: Model<ICoList> = mongoose.model<ICoList>('CoList', coListSchema);
export { CoList };
