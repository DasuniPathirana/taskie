const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Task" ADD COLUMN "estimatedHours" DOUBLE PRECISION;`);
    console.log('Added estimatedHours');
  } catch(e) { console.error('estimatedHours already exists or error:', e.message); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Task" ADD COLUMN "startDate" TIMESTAMP(3);`);
    console.log('Added startDate');
  } catch(e) { console.error('startDate already exists or error:', e.message); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Task" ADD COLUMN "endDate" TIMESTAMP(3);`);
    console.log('Added endDate');
  } catch(e) { console.error('endDate already exists or error:', e.message); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'New';`);
    console.log('Updated status default');
  } catch(e) { console.error('status default error:', e.message); }

  // Update existing tasks that are 'Todo' to 'New' to match new UI columns
  try {
    await prisma.$executeRawUnsafe(`UPDATE "Task" SET "status" = 'New' WHERE "status" = 'Todo';`);
    console.log('Migrated Todo to New');
  } catch(e) { console.error('Todo migration error:', e.message); }

  process.exit(0);
}

main();
