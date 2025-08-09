import { Request, Response } from "express";
import {
  createQuestionSchema,
  updateQuestionSchema,
} from "../validators/question.validator";
import { QuestionModel } from "./questions.model";

export class QuestionController {
  static async list(req: Request, res: Response) {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (req.query.level) filter.level = req.query.level;
    if (req.query.competency) filter.competency = req.query.competency;
    const [items, total] = await Promise.all([
      QuestionModel.find(filter).skip(skip).limit(limit),
      QuestionModel.countDocuments(filter),
    ]);
    res.json({ items, page, total, pages: Math.ceil(total / limit) });
  }

  static async get(req: Request, res: Response) {
    const doc = await QuestionModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ question: doc });
  }

  static async create(req: Request, res: Response) {
    const parsed = createQuestionSchema.parse(req.body);
    const doc = await QuestionModel.create({
      ...parsed,
      createdBy: req.user?.sub!,
    });
    res.status(201).json({ question: doc });
  }

  static async update(req: Request, res: Response) {
    const parsed = updateQuestionSchema.parse(req.body);
    const doc = await QuestionModel.findByIdAndUpdate(req.params.id, parsed, {
      new: true,
    });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ question: doc });
  }

  static async remove(req: Request, res: Response) {
    await QuestionModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  }

  static async bulk(req: Request, res: Response) {
    // Accept array of questions
    const items = Array.isArray(req.body) ? req.body : [];
    // Basic validation loop (could use zod array schema)
    const created = await QuestionModel.insertMany(
      items.map((q) => ({
        competency: q.competency,
        level: q.level,
        text: q.text,
        options: q.options,
        correctOptionKey: q.correctOptionKey,
        createdBy: req.user?.sub,
      }))
    );
    res.status(201).json({ count: created.length });
  }
}
