import { SessionService } from './session.service';
import { StartSessionDto } from './dto/start-session.dto';
export declare class SessionController {
    private readonly sessionService;
    constructor(sessionService: SessionService);
    start(startSessionDto: StartSessionDto): Promise<{
        id: string;
        createdAt: Date;
        startTime: Date;
        endTime: Date | null;
        topicId: string;
        durationMinutes: number;
    }>;
    stop(id: string): Promise<{
        id: string;
        createdAt: Date;
        startTime: Date;
        endTime: Date | null;
        topicId: string;
        durationMinutes: number;
    }>;
}
