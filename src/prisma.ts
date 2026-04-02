import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const datasourceUrl = process.env.DATABASE_URL;

if (!datasourceUrl) {
  throw new Error("DATABASE_URL is required to initialize PrismaClient");
}

const adapter = new PrismaBetterSqlite3({ url: datasourceUrl });

export const prisma = new PrismaClient({
  adapter,
});
