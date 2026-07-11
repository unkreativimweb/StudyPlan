import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): Promise<{
        id: string;
        defaultDurationS: number;
        defaultDurationM: number;
        defaultDurationL: number;
        defaultDurationXL: number;
        dailyBufferMinutes: number;
        maxDailyStudyMinutes: number;
    }>;
    updateSettings(updateSettingsDto: any): Promise<{
        id: string;
        defaultDurationS: number;
        defaultDurationM: number;
        defaultDurationL: number;
        defaultDurationXL: number;
        dailyBufferMinutes: number;
        maxDailyStudyMinutes: number;
    }>;
}
