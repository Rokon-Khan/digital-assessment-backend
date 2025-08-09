import mongoose, { Schema } from "mongoose";
import { IAssessmentAttempt } from "../../app/types/interfaces";

const attemptSchema = new Schema<IAssessmentAttempt>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    step: { type: Number, enum: [1, 2, 3], required: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
    status: {
      type: String,
      enum: ["in_progress", "submitted", "invalidated", "expired"],
      default: "in_progress",
    },
    questions: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        competency: String,
        level: { type: String },
        selectedOptionKey: String,
        correct: { type: Boolean, default: false },
      },
    ],
    scorePercent: Number,
    levelAwarded: { type: String, enum: ["A1", "A2", "B1", "B2", "C1", "C2"] },
    advancedToNext: Boolean,
    meta: {},
  },
  { timestamps: true }
);

export const AssessmentAttemptModel = mongoose.model<IAssessmentAttempt>(
  "AssessmentAttempt",
  attemptSchema
);
