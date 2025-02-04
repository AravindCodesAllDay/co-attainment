import mongoose, { Document, Schema } from 'mongoose';

// Define the ISeeStudent interface
interface ISeeStudent extends Document {
  _id: mongoose.Types.ObjectId;
  rollno: string;
  name: string;
  scores: Map<string, number>;
}

// Define the schema
const seeStudentSchema = new Schema<ISeeStudent>({
  rollno: { type: String, required: true },
  name: { type: String, required: true },
  scores: { type: Map, of: Number },
});

// Create the model
const SeeStudentModel = mongoose.model<ISeeStudent>(
  'SeeStudent',
  seeStudentSchema
);

export { SeeStudentModel, ISeeStudent, seeStudentSchema };
