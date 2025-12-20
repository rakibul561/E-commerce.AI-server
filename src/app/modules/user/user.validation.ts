import { z } from "zod";

const createUserValidationSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),

  name: z.string().min(1, "Name cannot be empty").optional(),

  password: z.string()
    .min(10, { message: "Password must be at least 10 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }).optional(),

  role: z.enum(["USER", "ADMIN"]).optional(),

  profilePicture: z.string().optional()
});

export const userValidation = {
  createUserValidationSchema
};
