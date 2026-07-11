"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- Adding Math Practice Topics ---');
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
        const topics = await prisma.topic.findMany({
            where: {
                examId: exam.id,
                isSichtung: false,
                category: 'NORMAL'
            }
        });
        for (const topic of topics) {
            if (topic.title.includes('(Übung)'))
                continue;
            const practiceTitle = `${topic.title} (Übung)`;
            const exists = await prisma.topic.findFirst({
                where: { examId: exam.id, title: practiceTitle }
            });
            if (!exists) {
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
//# sourceMappingURL=add-math-practice.js.map