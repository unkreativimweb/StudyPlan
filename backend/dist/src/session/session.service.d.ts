import { PrismaService } from '../prisma/prisma.service';
export declare class SessionService {
    private prisma;
    constructor(prisma: PrismaService);
    startSession(topicId: string): Promise<{
        id: string;
        createdAt: Date;
        startTime: Date;
        endTime: Date | null;
        topicId: string;
        durationMinutes: number;
    }>;
    stopSession(sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        startTime: Date;
        endTime: Date | null;
        topicId: string;
        durationMinutes: number;
    }>;
}
