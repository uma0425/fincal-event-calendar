// 完全にPrismaを無効化
export const prisma = {
  event: {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  },
  user: {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  },
  favorite: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    delete: async () => ({}),
  },
} as any 