import { NextFunction, Request, Response } from "express";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyPrefix: string;
};

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

const store = new Map<string, RateLimitEntry>();

export const createRateLimiter = ({ windowMs, max, keyPrefix }: RateLimitOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${keyPrefix}:${req.ip}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now - entry.windowStart >= windowMs) {
      store.set(key, { count: 1, windowStart: now });
      next();
      return;
    }

    if (entry.count >= max) {
      res.status(429).json({ error: "Too many requests, please try again later" });
      return;
    }

    entry.count += 1;
    next();
  };
};

export const clearRateLimitStore = (): void => {
  store.clear();
};