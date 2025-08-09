import mongoose, { Schema } from "mongoose";
import { IQuestion } from "../../types/interfaces";

const questionSchema = new Schema<IQuestion>(
  {
    competency: { type: String, required: true, index: true },
    level: {
      type: String,
      required: true,
      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
      index: true,
    },
    text: { type: String, required: true },
    options: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    correctOptionKey: { type: String, required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export const QuestionModel = mongoose.model<IQuestion>(
  "Question",
  questionSchema
);
