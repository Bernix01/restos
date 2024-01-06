import { logger } from "@/lib/log";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const log = logger.child({ module: "prisma" });
// Learn more about instantiating PrismaClient in Next.js here: https://www.prisma.io/docs/data-platform/accelerate/getting-started

const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "event",
        level: "error",
      },
      {
        emit: "event",
        level: "info",
      },
      {
        emit: "event",
        level: "warn",
      },
    ],
  });
  prisma.$on("query", (e) => {
    log.debug(e);
  });

  prisma.$on("error", (e) => {
    log.error(e);
  });

  prisma.$on("info", (e) => {
    log.info(e);
  });

  prisma.$on("warn", (e) => {
    log.warn(e);
  });
  return prisma.$extends(withAccelerate());
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const db = globalForPrisma.prisma ?? prismaClientSingleton();

export { db };

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
