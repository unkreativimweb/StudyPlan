import { SchedulerService } from './scheduler.service';
export declare class SchedulerController {
    private readonly schedulerService;
    constructor(schedulerService: SchedulerService);
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
            isPinned: boolean;
            expectedDurationMinutes: number | null;
            actualDurationMinutes: number;
            notBefore: Date | null;
            examId: string;
        }[];
    }>;
    getWeeklyPlan(): Promise<{
        date: Date;
        dayOfWeek: number;
        netTimeAvailable: number;
        timeAllocated: number;
        blockedMinutes: number;
        plan: {
            examName: string;
            examColor: string | null;
            scheduledMinutes: number;
            remainingDuration: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            size: string;
            status: string;
            order: number;
            isSichtung: boolean;
            isPinned: boolean;
            expectedDurationMinutes: number | null;
            actualDurationMinutes: number;
            notBefore: Date | null;
            examId: string;
        }[];
    }[]>;
}
