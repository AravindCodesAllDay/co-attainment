import mongoose, { Schema, Document, Model } from 'mongoose';
import { Batch, IBatch } from '../batch/batchModel';

export interface IUser extends Document {
  email: string;
  pswd: string;
  batches: IBatch[];
  cotypes: string[];
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    pswd: { type: String, required: true },
    batches: [Batch.schema],
    cotypes: { type: [String], default: ['understand', 'apply', 'analyse'] },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export { User };
