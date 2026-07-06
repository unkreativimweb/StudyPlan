import { PrismaService } from '../prisma/prisma.service';
export declare class SchedulerService {
    private prisma;
    constructor(prisma: PrismaService);
    getDailyPlan(): Promise<{
        date: Date;
        dayOfWeek: number;
        netTimeAvailable: number;
        timeAllocated: number;
        blockedMinutes: number;
        plan: any[];
        isDoable: boolean;
    }>;
    getWeeklyPlan(): Promise<{
        date: Date;
        dayOfWeek: number;
        netTimeAvailable: number;
        timeAllocated: number;
        blockedMinutes: number;
        plan: any[];
        isDoable: boolean;
    }[]>;
}
