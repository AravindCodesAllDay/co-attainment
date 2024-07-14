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
});

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

module.exports = {
  Namelist: mongoose.model("Namelist", namelistSchema),
  NamelistStudent: mongoose.model("NamelistStudent", studentSchema),
};
