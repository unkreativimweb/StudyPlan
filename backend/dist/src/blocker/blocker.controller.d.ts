import { BlockerService } from './blocker.service';
import { CreateBlockerDto } from './dto/create-blocker.dto';
export declare class BlockerController {
    private readonly blockerService;
    constructor(blockerService: BlockerService);
    create(createBlockerDto: CreateBlockerDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        dayOfWeek: number | null;
        specificDate: Date | null;
        startTime: string;
        endTime: string;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        dayOfWeek: number | null;
        specificDate: Date | null;
        startTime: string;
        endTime: string;
    }[]>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        dayOfWeek: number | null;
        specificDate: Date | null;
        startTime: string;
        endTime: string;
    }>;
}
