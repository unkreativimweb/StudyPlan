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
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SessionService = class SessionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startSession(topicId) {
        const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
        if (!topic)
            throw new common_1.NotFoundException('Topic not found');
        const running = await this.prisma.sessionTrack.findFirst({
            where: { topicId, endTime: null }
        });
        if (running)
            throw new common_1.BadRequestException('Session already running for this topic');
        if (topic.status === 'TODO') {
            await this.prisma.topic.update({
                where: { id: topicId },
                data: { status: 'IN_PROGRESS' }
            });
        }
        return this.prisma.sessionTrack.create({
            data: {
                topicId,
                startTime: new Date()
            }
        });
    }
    async stopSession(sessionId) {
        const session = await this.prisma.sessionTrack.findUnique({ where: { id: sessionId } });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.endTime)
            throw new common_1.BadRequestException('Session already stopped');
        const endTime = new Date();
        const durationMs = endTime.getTime() - session.startTime.getTime();
        const durationMinutes = Math.max(durationMs / 1000 / 60, 0);
        const updatedSession = await this.prisma.sessionTrack.update({
            where: { id: sessionId },
            data: {
                endTime,
                durationMinutes
            }
        });
        const topic = await this.prisma.topic.findUnique({ where: { id: session.topicId } });
        if (topic) {
            await this.prisma.topic.update({
                where: { id: topic.id },
                data: {
                    actualDurationMinutes: topic.actualDurationMinutes + durationMinutes
                }
            });
        }
        return updatedSession;
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionService);
//# sourceMappingURL=session.service.js.map