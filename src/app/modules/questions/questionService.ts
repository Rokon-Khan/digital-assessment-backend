import { IQuestion } from "../../types/interfaces";
import { levelsForStep } from "../../utils/assessmentRules";
import { QuestionModel } from "./questions.model";

export async function createQuestion(
  input: Omit<IQuestion, "_id" | "createdAt" | "updatedAt">
) {
  return QuestionModel.create(input);
}

export async function getQuestionsForStep(step: 1 | 2 | 3, limitPerLevel = 22) {
  const [level1, level2] = levelsForStep(step);
  // Random selection
  const pipeline = [
    { $match: { level: { $in: [level1, level2] } } },
    { $sample: { size: limitPerLevel * 2 } },
  ];
  const docs = await QuestionModel.aggregate(pipeline);
  return docs.slice(0, limitPerLevel * 2);
}
