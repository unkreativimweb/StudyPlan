import { SchedulerService } from './scheduler.service';
export declare class SchedulerController {
    private readonly schedulerService;
    constructor(schedulerService: SchedulerService);
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
