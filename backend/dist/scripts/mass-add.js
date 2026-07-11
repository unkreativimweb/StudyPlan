"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const readline = __importStar(require("readline/promises"));
const process_1 = require("process");
const prisma = new client_1.PrismaClient();
async function main() {
    const rl = readline.createInterface({ input: process_1.stdin, output: process_1.stdout });
    console.log('--- StudyPlan Mass Add Topics CLI ---');
    try {
        const exams = await prisma.exam.findMany({
            orderBy: { deadline: 'asc' }
        });
        if (exams.length === 0) {
            console.log('No exams found in the database. Please create an exam first.');
            rl.close();
            return;
        }
        console.log('\nAvailable Exams:');
        exams.forEach((ex, index) => {
            console.log(`[${index + 1}] ${ex.name} (Deadline: ${ex.deadline.toISOString().split('T')[0]})`);
        });
        let selectedExam = null;
        while (!selectedExam) {
            const answer = await rl.question('\nSelect an exam number to add topics to (or type 0 to quit): ');
            const num = parseInt(answer.trim(), 10);
            if (num === 0) {
                console.log('Exiting.');
                rl.close();
                return;
            }
            if (num > 0 && num <= exams.length) {
                selectedExam = exams[num - 1];
            }
            else {
                console.log('Invalid selection.');
            }
        }
        console.log(`\n>>> Selected Exam: ${selectedExam.name}`);
        let settings = await prisma.appSettings.findFirst();
        if (!settings) {
            console.log('No AppSettings found, creating default settings...');
            settings = await prisma.appSettings.create({ data: {} });
        }
        let addedCount = 0;
        console.log('\n--- Enter Topic Details (Leave Title empty to finish) ---');
        while (true) {
            const title = await rl.question('\nTopic Title (empty to quit): ');
            if (!title.trim()) {
                break;
            }
            let size = await rl.question('Size [S/M/L/XL] (default: S): ');
            size = size.trim().toUpperCase();
            if (!['S', 'M', 'L', 'XL'].includes(size)) {
                size = 'S';
            }
            const orderStr = await rl.question('Chapter/Order (optional, default: 0): ');
            let order = parseInt(orderStr.trim(), 10);
            if (isNaN(order))
                order = 0;
            const isSichtungStr = await rl.question('Is Sichtungsphase? [y/N]: ');
            const isSichtung = isSichtungStr.trim().toLowerCase() === 'y';
            let expectedDurationMinutes = settings.defaultDurationS;
            if (size === 'M')
                expectedDurationMinutes = settings.defaultDurationM;
            if (size === 'L')
                expectedDurationMinutes = settings.defaultDurationL;
            if (size === 'XL')
                expectedDurationMinutes = settings.defaultDurationXL;
            try {
                await prisma.topic.create({
                    data: {
                        examId: selectedExam.id,
                        title: title.trim(),
                        size,
                        order,
                        isSichtung,
                        status: 'TODO',
                        expectedDurationMinutes,
                    }
                });
                console.log(`✓ Added topic: "${title.trim()}" (${size})`);
                addedCount++;
            }
            catch (err) {
                console.error('Failed to add topic:', err);
            }
        }
        console.log(`\nFinished! Added ${addedCount} topics to ${selectedExam.name}.`);
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        rl.close();
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=mass-add.js.map