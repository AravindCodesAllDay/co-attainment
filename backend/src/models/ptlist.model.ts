import mongoose, { Schema, Document, Model } from 'mongoose';

interface IPtQuestion extends Document {
  number: number;
  option: string;
  mark: number;
}

const ptQuestionSchema = new Schema<IPtQuestion>({
  number: { type: Number, required: true },
  option: { type: String, required: true },
  mark: { type: Number, default: 0 },
});

interface IPtPart extends Document {
  title: string;
  maxMark: number;
  questions: IPtQuestion[];
}

const ptPartSchema = new Schema<IPtPart>({
  title: { type: String, required: true },
  maxMark: { type: Number, required: true },
  questions: { type: [ptQuestionSchema], required: true },
});

interface IPtStudent extends Document {
  rollno: string;
  name: string;
  totalMark: number;
  typemark: Map<string, number>;
  parts: IPtPart[];
}

const ptStudentSchema = new Schema<IPtStudent>({
  rollno: { type: String, required: true },
  name: { type: String, required: true },
  totalMark: { type: Number, default: 0 },
  typemark: { type: Map, of: Number, default: {} },
  parts: { type: [ptPartSchema], required: true },
});

interface IPtList extends Document {
  title: string;
  averagemark: number;
  maxMark: number;
  structure: any[];
  students: IPtStudent[];
}

const ptListSchema = new Schema<IPtList>(
  {
    title: { type: String, required: true },
    averagemark: { type: Number, default: 0 },
    maxMark: { type: Number, required: true },
    structure: { type: Schema.Types.Mixed, required: true },
    students: { type: [ptStudentSchema], required: true },
  },
  { timestamps: true }
);

const PtList: Model<IPtList> = mongoose.model<IPtList>('PtList', ptListSchema);
export { PtList };
