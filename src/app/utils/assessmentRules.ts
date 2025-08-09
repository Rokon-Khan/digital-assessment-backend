import { CompetencyLevel } from "../types/interfaces";

interface RuleResult {
  awarded: CompetencyLevel;
  advance: boolean;
}

export function evaluateStep(step: 1 | 2 | 3, percent: number): RuleResult {
  if (step === 1) {
    if (percent < 25) return { awarded: "A1", advance: false }; // fail (block retake)
    if (percent < 50) return { awarded: "A1", advance: false };
    if (percent < 75) return { awarded: "A2", advance: false };
    return { awarded: "A2", advance: true };
  }
  if (step === 2) {
    if (percent < 25) return { awarded: "A2", advance: false };
    if (percent < 50) return { awarded: "B1", advance: false };
    if (percent < 75) return { awarded: "B2", advance: false };
    return { awarded: "B2", advance: true };
  }
  // step 3
  if (percent < 25) return { awarded: "B2", advance: false };
  if (percent < 50) return { awarded: "C1", advance: false };
  return { awarded: "C2", advance: false };
}

export function levelsForStep(
  step: 1 | 2 | 3
): [CompetencyLevel, CompetencyLevel] {
  if (step === 1) return ["A1", "A2"];
  if (step === 2) return ["B1", "B2"];
  return ["C1", "C2"];
}
