import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSettings(): Promise<{
        id: string;
        defaultDurationS: number;
        defaultDurationM: number;
        defaultDurationL: number;
        defaultDurationXL: number;
        dailyBufferMinutes: number;
        maxDailyStudyMinutes: number;
    }>;
    updateSettings(data: any): Promise<{
        id: string;
        defaultDurationS: number;
        defaultDurationM: number;
        defaultDurationL: number;
        defaultDurationXL: number;
        dailyBufferMinutes: number;
        maxDailyStudyMinutes: number;
    }>;
}
