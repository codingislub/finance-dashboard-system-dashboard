import { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma";
import { HttpError } from "../utils/httpError";
import { verifyToken } from "../utils/jwt";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new HttpError(401, "Missing or invalid authorization header");
    }

    const token = authorization.slice(7); //removes Bearer prefix
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      throw new HttpError(401, "Invalid token: user not found");
    }

    if (user.status !== "ACTIVE") {
      throw new HttpError(403, "Inactive users cannot access this resource");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    next(error);
  }
};
