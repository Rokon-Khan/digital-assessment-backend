import { z } from "zod";

const optionSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

export const createQuestionSchema = z.object({
  competency: z.string().min(2),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  text: z.string().min(5),
  options: z.array(optionSchema).min(2),
  correctOptionKey: z.string().min(1),
});

export const updateQuestionSchema = createQuestionSchema.partial();
