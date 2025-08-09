import { Request, Response } from "express";
import {
  getUserAssessmentStatus,
  startAssessment,
  submitAssessment,
} from "./assessmentServices";

export class AssessmentController {
  static async start(req: Request, res: Response) {
    const attempt = await startAssessment(req.user!.sub);
    res.json({
      attemptId: attempt._id,
      step: attempt.step,
      questions: attempt.questions,
    });
  }

  static async submit(req: Request, res: Response) {
    const { attemptId, answers } = req.body;
    if (!attemptId || typeof answers !== "object")
      return res.status(400).json({ error: "Invalid payload" });
    const result = await submitAssessment(req.user!.sub, attemptId, answers);
    res.json({ attempt: result });
  }

  static async status(req: Request, res: Response) {
    const attempts = await getUserAssessmentStatus(req.user!.sub);
    res.json({ attempts });
  }

  static async history(req: Request, res: Response) {
    const attempts = await getUserAssessmentStatus(req.user!.sub);
    res.json({ attempts });
  }
}
