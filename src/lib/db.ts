import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient(
    process.env.DATABASE_URL 
      ? { datasources: { db: { url: process.env.DATABASE_URL } } } 
      : undefined
  )
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const db = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db
