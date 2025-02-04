import mongoose, { Schema, Document, Model } from 'mongoose';
import { IBatch } from '../batch/batchModel';

export interface IUser extends Document {
  email: string;
  bundles: IBatch[];
  cotypes: any[];
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    bundles: [{ type: Schema.Types.ObjectId, ref: 'Bundle' }],
    cotypes: { type: [String], default: [] },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export { User };
