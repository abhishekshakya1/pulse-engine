import { PrismaClient } from "@prisma/client";

// TypeScript ko batana ki globalThis ke pass ek optional prisma property ho sakti hai
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Agar global me already instance hai to wahi use karo, nahi to new banao
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

// Development me instance ko globalThis me preserve karo taaki Hot Reload pe connection leak na ho
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
