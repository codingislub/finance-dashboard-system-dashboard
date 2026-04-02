import { z } from "zod";
import { RecordTypes } from "../constants/enums";

export const createRecordSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(RecordTypes),
  category: z.string().trim().min(1),
  date: z.string().datetime(),
  notes: z.string().trim().max(500).optional(),
});

export const updateRecordSchema = z
  .object({
    amount: z.number().positive().optional(),
    type: z.enum(RecordTypes).optional(),
    category: z.string().trim().min(1).optional(),
    date: z.string().datetime().optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field is required",
  });

export const recordQuerySchema = z.object({
  type: z.enum(RecordTypes).optional(),
  category: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
