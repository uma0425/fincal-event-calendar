import { PrismaClient } from '@prisma/client'

// 一時的にPrismaクライアントを無効化
// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined
// }

// export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 一時的なダミークライアント
export const prisma = {
  event: {
    findMany: async () => [],
    findFirst: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  },
  user: {
    findMany: async () => [],
    findFirst: async () => null,
    create: async () => ({}),
  },
  favorite: {
    findMany: async () => [],
    create: async () => ({}),
    delete: async () => ({}),
  },
} as any 