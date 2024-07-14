const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

const bundleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  namelists: [
    {
      type: Schema.Types.ObjectId,
      ref: "Namelist",
    },
  ],
  semlists: [semSchema],
});

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
};
