import { Schema, Document } from 'mongoose';

export interface IPtQuestion extends Document {
  number: number;
  option: string;
  mark: number;
}

const ptQuestionSchema = new Schema<IPtQuestion>({
  number: { type: Number, required: true },
  option: { type: String, required: true },
  mark: { type: Number, default: 0 },
});

export { ptQuestionSchema };
