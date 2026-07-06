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
exports.TopicService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TopicService = class TopicService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBaseDuration(size) {
        const settings = await this.prisma.appSettings.findFirst();
        if (!settings) {
            const defaultMap = { S: 30, M: 60, L: 120, XL: 240 };
            return defaultMap[size] || 60;
        }
        switch (size) {
            case 'S': return settings.defaultDurationS;
            case 'M': return settings.defaultDurationM;
            case 'L': return settings.defaultDurationL;
            case 'XL': return settings.defaultDurationXL;
            default: return 60;
        }
    }
    async create(createTopicDto) {
        const expectedDuration = await this.getBaseDuration(createTopicDto.size);
        const exam = await this.prisma.exam.findUnique({ where: { id: createTopicDto.examId } });
        let factor = 1.0;
        if (exam) {
            switch (createTopicDto.size) {
                case 'S':
                    factor = exam.velocityFactorS;
                    break;
                case 'M':
                    factor = exam.velocityFactorM;
                    break;
                case 'L':
                    factor = exam.velocityFactorL;
                    break;
                case 'XL':
                    factor = exam.velocityFactorXL;
                    break;
            }
        }
        return this.prisma.topic.create({
            data: {
                examId: createTopicDto.examId,
                title: createTopicDto.title,
                size: createTopicDto.size,
                status: 'TODO',
                order: createTopicDto.order || 0,
                expectedDurationMinutes: expectedDuration * factor,
            },
        });
    }
    async update(id, updateTopicDto) {
        const topic = await this.prisma.topic.findUnique({ where: { id }, include: { exam: true } });
        if (!topic)
            throw new common_1.NotFoundException('Topic not found');
        const isCompleting = updateTopicDto.status === 'COMPLETED' && topic.status !== 'COMPLETED';
        const updated = await this.prisma.topic.update({
            where: { id },
            data: {
                ...updateTopicDto,
            },
        });
        if (isCompleting && !topic.isSichtung && topic.actualDurationMinutes > 0) {
            const baseDur = await this.getBaseDuration(topic.size);
            const measuredFactor = topic.actualDurationMinutes / baseDur;
            const clampedFactor = Math.min(Math.max(measuredFactor, 0.2), 5.0);
            const exam = topic.exam;
            let currentFactor = 1.0;
            switch (topic.size) {
                case 'S':
                    currentFactor = exam.velocityFactorS;
                    break;
                case 'M':
                    currentFactor = exam.velocityFactorM;
                    break;
                case 'L':
                    currentFactor = exam.velocityFactorL;
                    break;
                case 'XL':
                    currentFactor = exam.velocityFactorXL;
                    break;
            }
            const alpha = 0.3;
            const newFactor = (alpha * clampedFactor) + ((1 - alpha) * currentFactor);
            const updateData = {};
            switch (topic.size) {
                case 'S':
                    updateData.velocityFactorS = newFactor;
                    break;
                case 'M':
                    updateData.velocityFactorM = newFactor;
                    break;
                case 'L':
                    updateData.velocityFactorL = newFactor;
                    break;
                case 'XL':
                    updateData.velocityFactorXL = newFactor;
                    break;
            }
            await this.prisma.exam.update({
                where: { id: exam.id },
                data: updateData
            });
            await this.recalculateExpectedDurations(exam.id, topic.size, newFactor, baseDur);
        }
        if (isCompleting && topic.isSichtung) {
            await this.prisma.exam.update({
                where: { id: topic.examId },
                data: { sichtungsphaseCompleted: true }
            });
        }
        return updated;
    }
    async recalculateExpectedDurations(examId, size, newFactor, baseDur) {
        const topics = await this.prisma.topic.findMany({
            where: { examId, size, status: { in: ['TODO', 'IN_PROGRESS'] } }
        });
        for (const t of topics) {
            await this.prisma.topic.update({
                where: { id: t.id },
                data: { expectedDurationMinutes: baseDur * newFactor }
            });
        }
    }
    async remove(id) {
        return this.prisma.topic.delete({ where: { id } });
    }
};
exports.TopicService = TopicService;
exports.TopicService = TopicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TopicService);
//# sourceMappingURL=topic.service.js.map