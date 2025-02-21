import mongoose, { Schema, Document, Model } from 'mongoose';
import { ptStudentSchema, IPtStudent } from './ptStudentModel';
import { IPtPart, ptPartSchema } from './ptPartModel';

export interface IPtList extends Document {
  title: string;
  averagemark: number;
  maxMark: number;
  structure: IPtPart[];
  students: IPtStudent[];
}

const ptListSchema = new Schema<IPtList>(
  {
    title: { type: String, required: true },
    averagemark: { type: Number, default: 0 },
    maxMark: { type: Number, required: true },
    structure: { type: [ptPartSchema], required: true },
    students: { type: [ptStudentSchema], required: true },
  },
  { timestamps: true }
);

ptListSchema.pre('save', function (next) {
  const structure = this.get('structure') as IPtPart[];
  const maxMark = structure.reduce((sum, part) => sum + part.maxMark, 0);
  this.set('maxMark', maxMark);
  next();
});

const PtList: Model<IPtList> = mongoose.model<IPtList>('PtList', ptListSchema);
export { PtList };
