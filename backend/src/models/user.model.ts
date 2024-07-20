import mongoose, { Schema, Document, Model } from 'mongoose';

interface ISem extends Document {
  title: string;
  courselists: mongoose.Types.ObjectId[];
  ptlists: mongoose.Types.ObjectId[];
  seelists: mongoose.Types.ObjectId[];
}

const semSchema = new Schema<ISem>({
  title: { type: String, required: true },
  courselists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'COlist' }],
  ptlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PtList' }],
  seelists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SEE' }],
});

interface IBundle extends Document {
  title: string;
  namelists: mongoose.Types.ObjectId[];
  semlists: ISem[];
}

const bundleSchema = new Schema<IBundle>({
  title: { type: String, required: true },
  namelists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Namelist' }],
  semlists: { type: [semSchema], default: [] },
});

interface IUser extends Document {
  email: string;
  bundles: IBundle[];
  cotypes: any[];
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    bundles: { type: [bundleSchema], default: [] },
    cotypes: { type: [String], default: [] },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export { User };
