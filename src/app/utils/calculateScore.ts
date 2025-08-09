import { IAssessmentAttempt } from "../types/interfaces";

export function calculateScore(attempt: IAssessmentAttempt): number {
  const answered = attempt.questions.filter((q) => q.selectedOptionKey);
  if (answered.length === 0) return 0;
  const correct = answered.filter((q) => q.correct).length;
  return (correct / attempt.questions.length) * 100;
}
