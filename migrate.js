const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creating Notification table...');
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Notification" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "message" TEXT NOT NULL,
          "isRead" BOOLEAN NOT NULL DEFAULT false,
          "link" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
      );
    `);
    
    console.log('Adding foreign key constraint...');
    // Only add if it doesn't exist, to avoid errors
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Notification" 
        ADD CONSTRAINT "Notification_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
    } catch (e) {
      console.log('Constraint might already exist, ignoring error:', e.message);
    }
    
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
