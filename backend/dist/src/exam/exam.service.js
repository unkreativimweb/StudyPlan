"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ExamService = class ExamService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createExamDto) {
        const exam = await this.prisma.exam.create({
            data: {
                name: createExamDto.name,
                deadline: new Date(createExamDto.deadline),
                color: createExamDto.color,
            },
        });
        await this.prisma.topic.create({
            data: {
                examId: exam.id,
                title: 'Sichtungsphase (Stoffüberblick & Zerlegung)',
                size: 'S',
                status: 'TODO',
                isSichtung: true,
                order: -1,
                expectedDurationMinutes: 30,
            }
        });
        return this.prisma.exam.findUnique({
            where: { id: exam.id },
            include: { topics: true }
        });
    }
    async findAll() {
        return this.prisma.exam.findMany({
            include: {
                topics: {
                    orderBy: { order: 'asc' }
                },
            },
            orderBy: {
                deadline: 'asc',
            }
        });
    }
    async findOne(id) {
        const exam = await this.prisma.exam.findUnique({
            where: { id },
            include: {
                topics: {
                    orderBy: { order: 'asc' }
                }
            },
        });
        if (!exam)
            throw new common_1.NotFoundException('Exam not found');
        return exam;
    }
    async update(id, updateExamDto) {
        const data = { ...updateExamDto };
        if (updateExamDto.deadline) {
            data.deadline = new Date(updateExamDto.deadline);
        }
        return this.prisma.exam.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        return this.prisma.exam.delete({
            where: { id },
        });
    }
};
exports.ExamService = ExamService;
exports.ExamService = ExamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExamService);
//# sourceMappingURL=exam.service.js.map