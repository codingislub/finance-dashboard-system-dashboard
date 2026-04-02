import { z } from "zod";

export const trendQuerySchema = z.object({
  period: z.enum(["weekly", "monthly"]).default("monthly"),
  months: z.coerce.number().int().min(1).max(12).default(6),
});
