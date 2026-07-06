import { PrismaService } from '../prisma/prisma.service';
export declare class SchedulerService {
    private prisma;
    constructor(prisma: PrismaService);
    getDailyPlan(): Promise<{
        netTimeAvailable: number;
        timeAllocated: number;
        blockedMinutes: number;
        isDoable: boolean;
        plan: {
            examName: string;
            examColor: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            size: string;
            status: string;
            order: number;
            isSichtung: boolean;
            expectedDurationMinutes: number | null;
            actualDurationMinutes: number;
            examId: string;
        }[];
    }>;
}
