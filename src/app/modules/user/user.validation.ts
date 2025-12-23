import { z } from "zod";

const createUserValidationSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),

  firstName: z.string().min(3, "First name must be at least 3 characters"),
  lastName: z.string().min(3, "Last name must be at least 3 characters"),

  password: z
    .string()
    .min(10, { message: "Password must be at least 10 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),

  role: z.enum(["USER", "ADMIN"]).optional(),

  profilePicture: z.string().optional(),
});

/* 🔥 UPDATE PROFILE SCHEMA */
const updateUserValidationSchema = z
  .object({
    email: z.string().email().optional(),

    firstName: z.string().min(3, "First name must be at least 3 characters").optional(),
    lastName: z.string().min(3, "Last name must be at least 3 characters").optional(),

    oldPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(10, { message: "Password must be at least 10 characters long" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Password must contain at least one special character",
      })
      .optional(),

    profilePicture: z.string().optional(),
  })
  .refine(
    (data) => {
      // newPassword থাকলে oldPassword must
      if (data.newPassword && !data.oldPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Old password is required to set a new password",
      path: ["oldPassword"],
    }
  );

export const userValidation = {
  createUserValidationSchema,
  updateUserValidationSchema,
};
