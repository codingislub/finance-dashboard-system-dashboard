import bcrypt from "bcryptjs";
import { Router } from "express";
import { prisma } from "../prisma";
import { loginSchema, registerSchema } from "../schemas/authSchemas";
import { HttpError } from "../utils/httpError";
import { signToken } from "../utils/jwt";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
    if (existingUser) {
      throw new HttpError(409, "Email is already in use");
    }

    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "ADMIN" : "VIEWER"; //first user admin others viewer can be changed later 

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        role,
      },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    if (user.status !== "ACTIVE") {
      throw new HttpError(403, "User account is inactive");
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new HttpError(401, "Invalid email or password");
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
});
