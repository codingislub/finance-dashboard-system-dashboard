import { app } from "./app";
import { prisma } from "./prisma";

const port = Number(process.env.PORT ?? 4000);

const start = async (): Promise<void> => {
  try {
    await prisma.$connect();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

void start();
