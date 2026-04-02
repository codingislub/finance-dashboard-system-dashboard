import bcrypt from "bcryptjs";
import { Router } from "express";
import { prisma } from "../prisma";
import { createUserSchema, updateUserSchema } from "../schemas/userSchemas";
import { HttpError } from "../utils/httpError";

export const userRouter = Router();

userRouter.post("/", async (req, res, next) => {
  try {
    const body = createUserSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      throw new HttpError(409, "Email is already in use");
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        role: body.role,
        status: body.status,
      },
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

userRouter.get("/", async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
});

userRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = updateUserSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const updateData: {
      name?: string;
      role?: "VIEWER" | "ANALYST" | "ADMIN";
      status?: "ACTIVE" | "INACTIVE";
      passwordHash?: string;
    } = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.password !== undefined) {
      updateData.passwordHash = await bcrypt.hash(body.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
});
