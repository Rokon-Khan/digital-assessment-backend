import { QuestionModel } from "../questions/questions.model";
import { UserModel } from "../user/user.model";
import { evaluateStep, levelsForStep } from "../utils/assessmentRules.js";
import { calculateScore } from "../utils/calculateScore.js";
import { AssessmentAttemptModel } from "./assessmentAttempt.model";

export async function startAssessment(userId: string) {
  // Determine next step based on highest level or existing in-progress attempt
  const inProgress = await AssessmentAttemptModel.findOne({
    user: userId,
    status: "in_progress",
  });
  if (inProgress) return inProgress;

  const user = await UserModel.findById(userId);
  let step: 1 | 2 | 3 = 1;
  if (user?.currentLevel && ["B1", "B2"].includes(user.currentLevel)) step = 3; // If user is B1/B2 allow final step? (Business decision)
  if (user?.currentLevel && ["A2"].includes(user.currentLevel)) step = 2;

  const [l1, l2] = levelsForStep(step);
  const questions = await QuestionModel.aggregate([
    { $match: { level: { $in: [l1, l2] } } },
    { $sample: { size: 44 } },
  ]);
  const attempt = await AssessmentAttemptModel.create({
    user: userId,
    step,
    questions: questions.map((q: any) => ({
      questionId: q._id,
      competency: q.competency,
      level: q.level,
    })),
  });
  return attempt;
}

export async function submitAssessment(
  userId: string,
  attemptId: string,
  answers: Record<string, string>
) {
  const attempt = await AssessmentAttemptModel.findOne({
    _id: attemptId,
    user: userId,
  });
  if (!attempt) throw new Error("Attempt not found");
  if (attempt.status !== "in_progress")
    throw new Error("Attempt already submitted");

  // Apply answers
  attempt.questions = attempt.questions.map((q) => {
    const selected = answers[q.questionId.toString()];
    if (selected) {
      // Get question correct answer
      // We could optimize by prefetch or join.
      (q as any).selectedOptionKey = selected;
    }
    return q;
  });

  // Fetch correct answers
  const ids = attempt.questions.map((q) => q.questionId);
  const questionDocs = await QuestionModel.find({ _id: { $in: ids } });

  attempt.questions = attempt.questions.map((q) => {
    const doc = questionDocs.find(
      (d) => d._id.toString() === q.questionId.toString()
    );
    const correct = doc?.correctOptionKey === (q as any).selectedOptionKey;
    return { ...q, correct };
  });

  // Score
  const scorePercent = calculateScore(attempt as any);
  const evaluation = evaluateStep(attempt.step as any, scorePercent);
  attempt.scorePercent = scorePercent;
  attempt.levelAwarded = evaluation.awarded;
  attempt.advancedToNext = evaluation.advance;
  attempt.status = "submitted";
  attempt.submittedAt = new Date();
  await attempt.save();

  // Update user highest level if improved
  const user = await UserModel.findById(userId);
  if (user) {
    const hierarchy = ["A1", "A2", "B1", "B2", "C1", "C2"];
    if (
      !user.currentLevel ||
      hierarchy.indexOf(evaluation.awarded) >
        hierarchy.indexOf(user.currentLevel)
    ) {
      user.currentLevel = evaluation.awarded;
      await user.save();
    }
  }

  return attempt;
}

export async function getUserAssessmentStatus(userId: string) {
  const attempts = await AssessmentAttemptModel.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5);
  return attempts;
}
