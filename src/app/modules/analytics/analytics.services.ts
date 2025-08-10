import { AssessmentAttemptModel } from "../assessment/assessmentAttempt.model";
import { UserModel } from "../user/user.model";

export async function usersAnalytics() {
  const total = await UserModel.countDocuments();
  const byRole = await UserModel.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);
  return { total, byRole };
}

export async function competencyPerformance() {
  const pipeline = [
    { $match: { status: "submitted" } },
    { $unwind: "$questions" },
    {
      $group: {
        _id: { competency: "$questions.competency", level: "$questions.level" },
        total: { $sum: 1 },
        correct: { $sum: { $cond: ["$questions.correct", 1, 0] } },
      },
    },
    {
      $project: {
        competency: "$_id.competency",
        level: "$_id.level",
        accuracy: { $multiply: [{ $divide: ["$correct", "$total"] }, 100] },
      },
    },
  ];
  return AssessmentAttemptModel.aggregate(pipeline);
}

export async function assessmentsAnalytics() {
  const pipeline = [
    {
      $group: {
        _id: "$step",
        total: { $sum: 1 },
        submitted: {
          $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        step: "$_id",
        total: 1,
        completionRate: {
          $multiply: [{ $divide: ["$submitted", "$total"] }, 100],
        },
      },
    },
  ];
  return AssessmentAttemptModel.aggregate(pipeline);
}
