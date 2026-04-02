import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not configured in environment variables");
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, jwtSecret, { expiresIn: "1d" });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, jwtSecret) as JwtPayload;
};
