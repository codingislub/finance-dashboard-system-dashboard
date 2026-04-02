import { z } from "zod";
import { Roles, UserStatuses } from "../constants/enums";

export const createUserSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(6),
  role: z.enum(Roles).default("VIEWER"),
  status: z.enum(UserStatuses).default("ACTIVE"),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    role: z.enum(Roles).optional(),
    status: z.enum(UserStatuses).optional(),
    password: z.string().min(6).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field is required",
  });
