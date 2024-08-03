import mongoose, { Schema, Document, Model } from 'mongoose';

// Define Schemas First

//See
interface ISeeStudent extends Document {
  rollno: string;
  name: string;
  scores: Map<string, number>;
}

const seeStudentSchema = new Schema<ISeeStudent>({
  rollno: { type: String, required: true },
  name: { type: String, required: true },
  scores: { type: Map, of: Number, default: {} },
});

interface ISee extends Document {
  title: string;
  courses: string[];
  students: ISeeStudent[];
}

const seeSchema = new Schema<ISee>(
  {
    title: { type: String, required: true },
    courses: { type: [String] },
    students: { type: [seeStudentSchema] },
  },
  { timestamps: true }
);

export { ISee, ISeeStudent };

//course
interface ICoStudent extends Document {
  rollno: string;
  name: string;
  averageScore: number;
  scores: Map<string, number>;
}

const coStudentSchema = new Schema<ICoStudent>({
  rollno: { type: String, required: true },
  name: { type: String, required: true },
  averageScore: { type: Number, default: 0 },
  scores: { type: Map, of: Number, default: {} },
});

coStudentSchema.pre('save', function (next) {
  const scores = this.get('scores') as Map<string, number>;
  if (scores.size > 0) {
    const scoreValues = Array.from(scores.values());
    const totalScore = scoreValues.reduce((sum, score) => sum + score, 0);
    this.set('averageScore', totalScore / scoreValues.length);
  } else {
    this.set('averageScore', 0);
  }
  next();
});

interface ICoList extends Document {
  title: string;
  average: number;
  rows: string[];
  students: ICoStudent[];
}

const coListSchema = new Schema<ICoList>(
  {
    title: { type: String, required: true },
    average: { type: Number, default: 0 },
    rows: { type: [String], required: true },
    students: { type: [coStudentSchema] },
  },
  { timestamps: true }
);

coListSchema.pre('save', function (next) {
  const students = this.get('students') as ICoStudent[];
  if (students.length > 0) {
    const totalAverageScore = students.reduce(
      (sum, student) => sum + student.averageScore,
      0
    );
    this.set('average', totalAverageScore / students.length);
  } else {
    this.set('average', 0);
  }
  next();
});

export { ICoList, ICoStudent };

//pt
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

export { IPtList, IPtPart, IPtQuestion, IPtStudent };

// Define Other Schemas

//namelist
interface INameStudent extends Document {
  registration_no: number;
  rollno: string;
  name: string;
}

const nameStudentSchema = new Schema<INameStudent>({
  registration_no: { type: Number, required: true },
  rollno: { type: String, required: true },
  name: { type: String, required: true },
});

interface INamelist extends Document {
  title: string;
  students: INameStudent[];
}

const namelistSchema = new Schema<INamelist>(
  {
    title: { type: String, required: true },
    students: { type: [nameStudentSchema] },
  },
  { timestamps: true }
);

export { INamelist, INameStudent };

//sem
interface ISem extends Document {
  title: string;
  courselists: ICoList[];
  ptlists: IPtList[];
  seelists: ISee[];
}

const semSchema = new Schema<ISem>({
  title: { type: String, required: true },
  courselists: [coListSchema],
  ptlists: [ptListSchema],
  seelists: [seeSchema],
});

export { ISem };

// bundle
interface IBundle extends Document {
  title: string;
  namelists: INamelist[];
  semlists: ISem[];
}

const bundleSchema = new Schema<IBundle>({
  title: { type: String, required: true },
  namelists: [namelistSchema],
  semlists: [semSchema],
});

export { IBundle };

//user
interface IUser extends Document {
  email: string;
  bundles: IBundle[];
  cotypes: any[];
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    bundles: [bundleSchema],
    cotypes: { type: [String], default: [] },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export { User, IUser };
