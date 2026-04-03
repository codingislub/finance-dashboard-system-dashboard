import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { authenticate } from "./middlewares/authMiddleware";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { createRateLimiter } from "./middlewares/rateLimit";
import { requireRole } from "./middlewares/requireRole";
import { authRouter } from "./routes/authRoutes";
import { dashboardRouter } from "./routes/dashboardRoutes";
import { healthRouter } from "./routes/healthRoutes";
import { recordRouter } from "./routes/recordRoutes";
import { userRouter } from "./routes/userRoutes";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // for debugging

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyPrefix: "auth",
});

const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  keyPrefix: "api",
});

app.use("/health", healthRouter);
app.use("/auth", authRateLimiter, authRouter);

app.use(
  "/users",
  apiRateLimiter,
  authenticate,
  requireRole("ADMIN"),
  userRouter,
);

app.use(
  "/records",
  apiRateLimiter,
  authenticate,
  requireRole("VIEWER", "ANALYST", "ADMIN"),
  (req, res, next) => {
    if (req.method === "GET") return next();
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can modify records" });
    }
    return next();
  },
  recordRouter,
);

app.use(
  "/dashboard",
  apiRateLimiter,
  authenticate,
  requireRole("VIEWER", "ANALYST", "ADMIN"),
  dashboardRouter,
);

app.use(notFoundHandler);
app.use(errorHandler);
