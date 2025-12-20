import { z } from "zod";

const createProductSchema = z.object({
  // optional product name (user manually add করলে)
  title: z.string().min(1, "Title cannot be empty").optional(),

  // optional category
  category: z.string().min(1).optional(),

  // optional tags (comma separated string থেকে array বানাতে পারো)
  tags: z.array(z.string()).optional(),

  // optional draft flag (normally true থাকবে)
  isDraft: z.boolean().optional()
});

export const productValidation = {
  createProductSchema
};
