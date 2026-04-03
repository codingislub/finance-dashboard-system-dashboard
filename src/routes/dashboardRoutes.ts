import { Router } from "express";
import { trendQuerySchema } from "../schemas/dashboardSchemas";
import { getDashboardOverview, getTrendData } from "../services/dashboardService";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const summary = await getDashboardOverview(req.user.id);
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
});

dashboardRouter.get("/trends", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = trendQuerySchema.parse(req.query);
    const trends = await getTrendData(req.user.id, query.period, query.months);
    res.status(200).json({ period: query.period, points: trends });
  } catch (error) {
    next(error);
  }
});
