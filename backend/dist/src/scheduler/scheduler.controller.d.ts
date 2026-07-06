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
            expectedDurationMinutes: number | null;
            actualDurationMinutes: number;
            examId: string;
        }[];
    }>;
}
