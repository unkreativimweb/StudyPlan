import { PrismaService } from '../prisma/prisma.service';
import { CreateBlockerDto } from './dto/create-blocker.dto';
import { UpdateBlockerDto } from './dto/update-blocker.dto';
export declare class BlockerService {
    private prisma;
    constructor(prisma: PrismaService);
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
    update(id: string, updateBlockerDto: UpdateBlockerDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        dayOfWeek: number | null;
        specificDate: Date | null;
        startTime: string;
        endTime: string;
    }>;
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
