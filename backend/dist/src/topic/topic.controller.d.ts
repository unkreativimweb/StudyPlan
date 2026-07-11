import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
export declare class TopicController {
    private readonly topicService;
    constructor(topicService: TopicService);
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
