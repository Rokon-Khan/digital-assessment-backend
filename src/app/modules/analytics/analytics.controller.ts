import { Request, Response } from "express";
import {
  assessmentsAnalytics,
  competencyPerformance,
  usersAnalytics,
} from "./analytics.services";

export class AnalyticsController {
  static async users(req: Request, res: Response) {
    const data = await usersAnalytics();
    res.json({ data });
  }

  static async competency(req: Request, res: Response) {
    const data = await competencyPerformance();
    res.json({ data });
  }

  static async assessments(req: Request, res: Response) {
    const data = await assessmentsAnalytics();
    res.json({ data });
  }

  static async export(_req: Request, res: Response) {
    // TODO: Implement CSV / PDF export
    res.json({ message: "Export stub" });
  }
}
