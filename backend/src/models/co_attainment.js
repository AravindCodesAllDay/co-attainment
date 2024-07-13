const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  registration_no: {
    type: Number,
    required: true,
    unique: true,
  },
  rollno: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  averageScore: {
    type: Number,
    default: 0,
  },
  scores: {
    type: Map,
    of: Number,
    default: {},
  },
  totalMark: {
    type: Number,
    default: 0,
  },
  typemark: {
    type: Map,
    of: Number,
    default: {},
  },
  parts: [
    new Schema({
      title: {
        type: String,
        required: true,
      },
      maxMark: {
        type: Number,
        required: true,
      },
      questions: [
        new Schema({
          number: {
            type: Number,
            required: true,
          },
          option: {
            type: String,
            required: true,
          },
          mark: {
            type: Number,
            default: 0,
          },
        }),
      ],
    }),
  ],
});

// Pre-save middleware to calculate averageScore before saving
studentSchema.pre("save", function (next) {
  if (this.scores.size > 0) {
    const scoreValues = Array.from(this.scores.values());
    const totalScore = scoreValues.reduce((sum, score) => sum + score, 0);
    this.averageScore = totalScore / scoreValues.length;
  } else {
    this.averageScore = 0;
  }
  next();
});

// Define the schema for the course list (PtList)
const ptListSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    averagemark: {
      type: Number,
      default: 0,
    },
    maxMark: {
      type: Number,
      required: true,
    },
    structure: {
      type: [],
      require: true,
    },
    students: [studentSchema],
  },
  {
    timestamps: true,
  }
);

const seeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    courses: {
      type: [String],
    },
    students: [studentSchema],
  },
  {
    timestamps: true,
  }
);

const namelistSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    students: [studentSchema],
  },
  {
    timestamps: true,
  }
);

const colistSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    average: {
      type: Number,
      default: 0,
    },
    rows: {
      type: [String],
      required: true,
    },
    students: [studentSchema],
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate average of students' averageScores before saving
colistSchema.pre("save", function (next) {
  if (this.students.length > 0) {
    const totalAverageScore = this.students.reduce(
      (sum, student) => sum + student.averageScore,
      0
    );
    this.average = totalAverageScore / this.students.length;
  } else {
    this.average = 0;
  }
  next();
});

// Define the schema for semester (semSchema)
const semSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  courselists: [
    {
      type: Schema.Types.ObjectId,
      ref: "COlist",
    },
  ],
  ptlists: [
    {
      type: Schema.Types.ObjectId,
      ref: "PtList",
    },
  ],
  seelists: [
    {
      type: Schema.Types.ObjectId,
      ref: "SEE",
    },
  ],
});

// Define the schema for bundle (bundleSchema)
const bundleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  namelists: [
    {
      type: Schema.Types.ObjectId,
      ref: "NameList",
    },
  ],
  semlists: [semSchema],
});

// Define the schema for user (userSchema)
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    bundles: [bundleSchema],
    cotypes: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = {
  User: mongoose.model("User", userSchema),
  Bundle: mongoose.model("Bundle", bundleSchema),
  Sem: mongoose.model("Sem", semSchema),
  SEE: mongoose.model("SEE", seeSchema),
  PtList: mongoose.model("PtList", ptListSchema),
  NameList: mongoose.model("NameList", namelistSchema),
  COlist: mongoose.model("COlist", colistSchema),
};
