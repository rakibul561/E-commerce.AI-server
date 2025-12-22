import { z } from "zod";

const createProductSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").optional(),

  category: z.string().min(1).optional(),

  tags: z.array(z.string()).optional(),

  isDraft: z.boolean().optional()
});

export const productValidation = {
  createProductSchema
};
