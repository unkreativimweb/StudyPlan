import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
export declare class ExamService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createExamDto: CreateExamDto): Promise<({
        topics: {
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
        }[];
    } & {
        id: string;
        name: string;
        deadline: Date;
        color: string | null;
        sichtungsphaseCompleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        velocityFactorS: number;
        velocityFactorM: number;
        velocityFactorL: number;
        velocityFactorXL: number;
    }) | null>;
    findAll(): Promise<({
        topics: {
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
        }[];
    } & {
        id: string;
        name: string;
        deadline: Date;
        color: string | null;
        sichtungsphaseCompleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        velocityFactorS: number;
        velocityFactorM: number;
        velocityFactorL: number;
        velocityFactorXL: number;
    })[]>;
    findOne(id: string): Promise<{
        topics: {
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
        }[];
    } & {
        id: string;
        name: string;
        deadline: Date;
        color: string | null;
        sichtungsphaseCompleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        velocityFactorS: number;
        velocityFactorM: number;
        velocityFactorL: number;
        velocityFactorXL: number;
    }>;
    update(id: string, updateExamDto: UpdateExamDto): Promise<{
        id: string;
        name: string;
        deadline: Date;
        color: string | null;
        sichtungsphaseCompleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        velocityFactorS: number;
        velocityFactorM: number;
        velocityFactorL: number;
        velocityFactorXL: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        deadline: Date;
        color: string | null;
        sichtungsphaseCompleted: boolean;
        createdAt: Date;
        updatedAt: Date;
        velocityFactorS: number;
        velocityFactorM: number;
        velocityFactorL: number;
        velocityFactorXL: number;
    }>;
}
