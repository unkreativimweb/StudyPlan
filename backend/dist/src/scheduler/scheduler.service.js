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
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SchedulerService = class SchedulerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDailyPlan() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        const blockers = await this.prisma.fixedBlocker.findMany({
            where: {
                OR: [
                    { dayOfWeek },
                    { specificDate: { gte: startOfDay, lt: endOfDay } }
                ]
            }
        });
        let blockedMinutes = 0;
        for (const b of blockers) {
            const [startH, startM] = b.startTime.split(':').map(Number);
            const [endH, endM] = b.endTime.split(':').map(Number);
            blockedMinutes += ((endH * 60) + endM) - ((startH * 60) + startM);
        }
        const settings = await this.prisma.appSettings.findFirst();
        const buffer = settings?.dailyBufferMinutes || 60;
        const netTimeAvailable = (24 * 60) - blockedMinutes - buffer;
        const exams = await this.prisma.exam.findMany({
            include: {
                topics: {
                    where: { status: { in: ['TODO', 'IN_PROGRESS'] } }
                }
            }
        });
        const plan = [];
        let timeAllocated = 0;
        for (const exam of exams) {
            const pinnedTopics = exam.topics.filter(t => t.isPinned);
            for (const topic of pinnedTopics) {
                const dur = topic.expectedDurationMinutes || 60;
                if (timeAllocated + dur <= netTimeAvailable) {
                    plan.push({ ...topic, examName: exam.name, examColor: exam.color });
                    timeAllocated += dur;
                }
                else if (plan.length === 0) {
                    plan.push({ ...topic, examName: exam.name, examColor: exam.color });
                    timeAllocated += dur;
                }
            }
        }
        exams.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
        for (const exam of exams) {
            if (exam.topics.length === 0)
                continue;
            let availableTopics = [];
            if (!exam.sichtungsphaseCompleted) {
                availableTopics = exam.topics.filter(t => t.isSichtung && !t.isPinned);
            }
            else {
                availableTopics = exam.topics.filter(t => !t.isSichtung && !t.isPinned);
            }
            availableTopics = availableTopics.filter(t => !t.notBefore || t.notBefore <= endOfDay);
            availableTopics.sort((a, b) => a.order - b.order);
            for (const topic of availableTopics) {
                const dur = topic.expectedDurationMinutes || 60;
                if (timeAllocated + dur <= netTimeAvailable) {
                    plan.push({ ...topic, examName: exam.name, examColor: exam.color });
                    timeAllocated += dur;
                }
                else {
                    if (plan.length === 0) {
                        plan.push({ ...topic, examName: exam.name, examColor: exam.color });
                        timeAllocated += dur;
                    }
                    break;
                }
            }
        }
        const isDoable = true;
        return {
            netTimeAvailable,
            timeAllocated,
            blockedMinutes,
            isDoable,
            plan
        };
    }
    async getWeeklyPlan() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const settings = await this.prisma.appSettings.findFirst();
        const buffer = settings?.dailyBufferMinutes || 60;
        const allBlockers = await this.prisma.fixedBlocker.findMany();
        const exams = await this.prisma.exam.findMany({
            include: {
                topics: {
                    where: { status: { in: ['TODO', 'IN_PROGRESS'] } },
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { deadline: 'asc' }
        });
        const weeklySchedule = [];
        const examStates = exams.map(e => ({
            ...e,
            topics: e.topics.map(t => ({ ...t, remainingDuration: t.expectedDurationMinutes || 60 }))
        }));
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const currentDay = new Date(today);
            currentDay.setDate(today.getDate() + dayOffset);
            const dayOfWeek = currentDay.getDay();
            const endOfDay = new Date(currentDay);
            endOfDay.setHours(23, 59, 59, 999);
            let blockedMinutes = 0;
            for (const b of allBlockers) {
                let isBlockingToday = false;
                if (b.dayOfWeek === dayOfWeek)
                    isBlockingToday = true;
                if (b.specificDate && b.specificDate >= currentDay && b.specificDate <= endOfDay) {
                    isBlockingToday = true;
                }
                if (isBlockingToday) {
                    const [startH, startM] = b.startTime.split(':').map(Number);
                    const [endH, endM] = b.endTime.split(':').map(Number);
                    blockedMinutes += ((endH * 60) + endM) - ((startH * 60) + startM);
                }
            }
            const netTimeAvailable = (24 * 60) - blockedMinutes - buffer;
            const dailyPlan = [];
            let timeAllocated = 0;
            for (const exam of examStates) {
                const pinnedTopics = exam.topics.filter(t => t.isPinned && t.remainingDuration > 0);
                for (const topic of pinnedTopics) {
                    if (timeAllocated < netTimeAvailable) {
                        const timeToAllocate = Math.min(topic.remainingDuration, netTimeAvailable - timeAllocated);
                        if (timeToAllocate > 0) {
                            dailyPlan.push({ ...topic, examName: exam.name, examColor: exam.color, scheduledMinutes: timeToAllocate });
                            timeAllocated += timeToAllocate;
                            topic.remainingDuration -= timeToAllocate;
                            if (topic.isSichtung && topic.remainingDuration <= 0) {
                                exam.sichtungsphaseCompleted = true;
                            }
                        }
                    }
                }
            }
            for (const exam of examStates) {
                if (exam.topics.length === 0)
                    continue;
                let availableTopics = exam.topics.filter(t => t.remainingDuration > 0 && !t.isPinned);
                if (!exam.sichtungsphaseCompleted) {
                    const sichtung = availableTopics.find(t => t.isSichtung);
                    availableTopics = sichtung ? [sichtung] : [];
                }
                availableTopics = availableTopics.filter(t => !t.notBefore || t.notBefore <= endOfDay);
                for (const topic of availableTopics) {
                    if (timeAllocated < netTimeAvailable) {
                        const timeToAllocate = Math.min(topic.remainingDuration, netTimeAvailable - timeAllocated);
                        if (timeToAllocate > 0) {
                            dailyPlan.push({ ...topic, examName: exam.name, examColor: exam.color, scheduledMinutes: timeToAllocate });
                            timeAllocated += timeToAllocate;
                            topic.remainingDuration -= timeToAllocate;
                            if (topic.isSichtung && topic.remainingDuration <= 0) {
                                exam.sichtungsphaseCompleted = true;
                            }
                        }
                    }
                }
            }
            weeklySchedule.push({
                date: currentDay,
                dayOfWeek,
                netTimeAvailable,
                timeAllocated,
                blockedMinutes,
                plan: dailyPlan
            });
        }
        return weeklySchedule;
    }
};
exports.SchedulerService = SchedulerService;
exports.SchedulerService = SchedulerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map