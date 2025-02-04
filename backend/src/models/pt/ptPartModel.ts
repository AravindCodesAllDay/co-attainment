import { Schema, Document } from 'mongoose';
import { ptQuestionSchema, IPtQuestion } from './ptQuestionModel';

export interface IPtPart extends Document {
  title: string;
  maxMark: number;
  questions: IPtQuestion[];
}

const ptPartSchema = new Schema<IPtPart>({
  title: { type: String, required: true },
  maxMark: { type: Number, required: true },
  questions: { type: [ptQuestionSchema], required: true },
});

export { ptPartSchema };
