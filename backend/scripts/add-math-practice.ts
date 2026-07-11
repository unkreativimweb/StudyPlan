import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Adding Math Practice Topics ---');
  
  // Find all math exams
  const mathExams = await prisma.exam.findMany({
    where: {
      name: { contains: 'Mathe' }
    }
  });

  if (mathExams.length === 0) {
    console.log('No math exams found.');
    return;
  }

  let addedCount = 0;

  for (const exam of mathExams) {
    console.log(`Processing exam: ${exam.name}`);
    
    // Find all topics in this exam
    const topics = await prisma.topic.findMany({
      where: {
        examId: exam.id,
        isSichtung: false,
        category: 'NORMAL' // only normal topics
      }
    });

    for (const topic of topics) {
      if (topic.title.includes('(Übung)')) continue; // skip if already practice

      const practiceTitle = `${topic.title} (Übung)`;
      
      // Check if it already exists
      const exists = await prisma.topic.findFirst({
        where: { examId: exam.id, title: practiceTitle }
      });

      if (!exists) {
        // AppSettings logic isn't strictly needed if we just pass a default expected duration,
        // but we can fetch it to be safe.
        const settings = await prisma.appSettings.findFirst();
        const durationM = settings?.defaultDurationM || 60;

        await prisma.topic.create({
          data: {
            examId: exam.id,
            title: practiceTitle,
            size: 'M',
            status: 'TODO',
            order: topic.order, 
            isSichtung: false,
            category: 'PRACTICE',
            expectedDurationMinutes: durationM
          }
        });
        console.log(`✓ Added: "${practiceTitle}"`);
        addedCount++;
      }
    }
  }

  console.log(`\nFinished! Added ${addedCount} practice topics.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
