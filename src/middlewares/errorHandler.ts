import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError";
import { flattenZodError } from "../utils/validation";

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ error: "Route not found" });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ error: flattenZodError(err) });
    return;
  }

  if (typeof err === "object" && err !== null && "code" in err) {
    const prismaLikeError = err as { code?: string };
    if (prismaLikeError.code === "P2002") {
      res.status(409).json({ error: "Unique constraint violation" });
      return;
    }
  }

  res.status(500).json({ error: "Internal server error" });
};
