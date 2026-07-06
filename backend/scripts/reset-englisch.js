const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const exams = await prisma.exam.findMany();
  for (const exam of exams) {
    if (exam.name.toLowerCase().includes('englisch')) {
      await prisma.exam.update({
        where: { id: exam.id },
        data: { sichtungsphaseCompleted: false },
      });
      console.log(`Reset sichtungsphaseCompleted for ${exam.name}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
