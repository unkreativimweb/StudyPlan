"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const e1 = await prisma.exam.create({
        data: { name: 'Mathe', deadline: new Date('2026-07-22'), color: 'blue' }
    });
    await prisma.topic.create({
        data: {
            examId: e1.id, title: 'Sichtungsphase (Blocker)', size: 'S', isSichtung: true, status: 'TODO', expectedDurationMinutes: 30
        }
    });
    await prisma.topic.create({
        data: { examId: e1.id, title: 'Lineare Algebra Zusammenfassung', size: 'L', status: 'TODO', expectedDurationMinutes: 120 }
    });
    const e2 = await prisma.exam.create({
        data: { name: 'Englisch (Mündlich)', deadline: new Date('2026-07-17'), color: 'red' }
    });
    await prisma.topic.create({
        data: {
            examId: e2.id, title: 'Sichtungsphase', size: 'S', isSichtung: true, status: 'COMPLETED', expectedDurationMinutes: 30
        }
    });
    await prisma.exam.update({
        where: { id: e2.id },
        data: { sichtungsphaseCompleted: true }
    });
    await prisma.topic.create({
        data: { examId: e2.id, title: 'Vokabeln Unit 1-5', size: 'M', status: 'TODO', expectedDurationMinutes: 60 }
    });
    await prisma.fixedBlocker.create({
        data: { title: 'Schlaf', startTime: '23:00', endTime: '07:00' }
    });
    await prisma.fixedBlocker.create({
        data: { title: 'Vorlesung', startTime: '10:00', endTime: '14:30', dayOfWeek: new Date().getDay() }
    });
}
main()
    .then(() => console.log('Seeded successfully'))
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map