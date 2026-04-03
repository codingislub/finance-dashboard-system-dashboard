import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import {
  createRecordSchema,
  recordQuerySchema,
  updateRecordSchema,
} from "../schemas/recordSchemas";
import { HttpError } from "../utils/httpError";

export const recordRouter = Router();

recordRouter.post("/", async (req, res, next) => {
  try {
    const body = createRecordSchema.parse(req.body);

    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const record = await prisma.financialRecord.create({
      data: {
        amount: body.amount,
        type: body.type,
        category: body.category,
        date: new Date(body.date),
        notes: body.notes,
        createdById: req.user.id,
      },
    });

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

recordRouter.get("/", async (req, res, next) => {
  try {
    const query = recordQuerySchema.parse(req.query);

    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const where: Prisma.FinancialRecordWhereInput = {
      deletedAt: null,
      createdById: req.user.id,//Users only see their own records
    };
    if (query.type) where.type = query.type;
    if (query.category) where.category = query.category;
    if (query.search) {
      where.OR = [
        { category: { contains: query.search } },
        { notes: { contains: query.search } },
      ];
    }

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }

    const skip = (query.page - 1) * query.pageSize;
    const take = query.pageSize;

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take,
      }),
      prisma.financialRecord.count({ where }),
    ]);

    res.status(200).json({
      records,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
});

recordRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = updateRecordSchema.parse(req.body);

    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const existing = await prisma.financialRecord.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      throw new HttpError(404, "Record not found");
    }
    if (existing.createdById !== req.user.id) {
      throw new HttpError(403, "Forbidden");
    }

    const updated = await prisma.financialRecord.update({
      where: { id: req.params.id },
      data: {
        amount: body.amount,
        type: body.type,
        category: body.category,
        date: body.date ? new Date(body.date) : undefined,
        notes: body.notes,
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});

recordRouter.delete("/:id", async (req, res, next) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const existing = await prisma.financialRecord.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      throw new HttpError(404, "Record not found");
    }
    if (existing.createdById !== req.user.id) {
      throw new HttpError(403, "Forbidden");
    }

    await prisma.financialRecord.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.status(200).json({ message: "Record deleted" });
  } catch (error) {
    next(error);
  }
});
