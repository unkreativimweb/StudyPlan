import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
export declare class TopicService {
    private prisma;
    constructor(prisma: PrismaService);
    getBaseDuration(size: string): Promise<number>;
    create(createTopicDto: CreateTopicDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        size: string;
        status: string;
        order: number;
        isSichtung: boolean;
        isPinned: boolean;
        category: string;
        expectedDurationMinutes: number | null;
        actualDurationMinutes: number;
        notBefore: Date | null;
        examId: string;
    }>;
    update(id: string, updateTopicDto: UpdateTopicDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        size: string;
        status: string;
        order: number;
        isSichtung: boolean;
        isPinned: boolean;
        category: string;
        expectedDurationMinutes: number | null;
        actualDurationMinutes: number;
        notBefore: Date | null;
        examId: string;
    }>;
    private recalculateExpectedDurations;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        size: string;
        status: string;
        order: number;
        isSichtung: boolean;
        isPinned: boolean;
        category: string;
        expectedDurationMinutes: number | null;
        actualDurationMinutes: number;
        notBefore: Date | null;
        examId: string;
    }>;
}
