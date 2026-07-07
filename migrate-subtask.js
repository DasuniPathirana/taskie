const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding description column to Subtask table...');
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Subtask" ADD COLUMN "description" TEXT;
    `);
    console.log('Migration successful!');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Column already exists.');
    } else {
      console.error('Migration failed:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
