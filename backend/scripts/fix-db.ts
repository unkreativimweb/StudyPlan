import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Running DB fix script...');
  const exams = await prisma.exam.findMany();
  
  for (const exam of exams) {
    // 1. Reset Englisch Mündlich
    if (exam.name.toLowerCase().includes('englisch mündlich') || exam.name.toLowerCase().includes('englisch muendlich')) {
      await prisma.exam.update({
        where: { id: exam.id },
        data: { sichtungsphaseCompleted: false },
      });
      console.log(`Reset sichtungsphaseCompleted for ${exam.name}`);
    }

    // 2. Ensure Sichtungsphase topic exists
    const topics = await prisma.topic.findMany({ where: { examId: exam.id } });
    const hasSichtung = topics.some(t => t.isSichtung);
    if (!hasSichtung) {
      await prisma.topic.create({
        data: {
          examId: exam.id,
          title: 'Sichtungsphase',
          size: 'S',
          status: 'TODO',
          isSichtung: true,
          expectedDurationMinutes: 30, // Fallback
          order: 0,
        }
      });
      console.log(`Created missing Sichtungsphase for ${exam.name}`);
    }
  }
  console.log('DB fix complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
