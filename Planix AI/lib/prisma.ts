import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use the new URL explicitly to bypass OS environment variable caching
const dbUrl = "postgresql://postgres:Planix202wiiner@db.osttomrgkqjmtemyfzlj.supabase.co:5432/postgres";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
