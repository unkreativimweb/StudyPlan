import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulerService {
  constructor(private prisma: PrismaService) {}

  async getDailyPlan() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Start of day and End of day for exact date matching
    const startOfDay = new Date(today);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23,59,59,999);
    
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

    // Grab pinned topics first
    for (const exam of exams) {
      const pinnedTopics = exam.topics.filter(t => t.isPinned);
      for (const topic of pinnedTopics) {
        const dur = topic.expectedDurationMinutes || 60;
        if (timeAllocated + dur <= netTimeAvailable) {
          plan.push({ ...topic, examName: exam.name, examColor: exam.color });
          timeAllocated += dur;
        } else if (plan.length === 0) {
          plan.push({ ...topic, examName: exam.name, examColor: exam.color });
          timeAllocated += dur;
        }
      }
    }

    // Priorisiere nach Deadline
    exams.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

    for (const exam of exams) {
      if (exam.topics.length === 0) continue;

      let availableTopics = [];
      
      // Sichtungsphase-Blocker Logik
      if (!exam.sichtungsphaseCompleted) {
        availableTopics = exam.topics.filter(t => t.isSichtung && !t.isPinned);
      } else {
        availableTopics = exam.topics.filter(t => !t.isSichtung && !t.isPinned);
      }

      // Filter out topics deferred to a future date
      availableTopics = availableTopics.filter(t => !t.notBefore || t.notBefore <= endOfDay);

      // Sortiere nach manueller Prio
      availableTopics.sort((a, b) => a.order - b.order);

      for (const topic of availableTopics) {
        const dur = topic.expectedDurationMinutes || 60;
        if (timeAllocated + dur <= netTimeAvailable) {
          plan.push({ ...topic, examName: exam.name, examColor: exam.color });
          timeAllocated += dur;
        } else {
          // Fallback: Mindestens ein Topic am Tag, auch wenn es das Budget sprengt
          if (plan.length === 0) {
            plan.push({ ...topic, examName: exam.name, examColor: exam.color });
            timeAllocated += dur;
          }
          break; // Stop scheduling for this exam if we hit the limit
        }
      }
    }

    // Warn-Flag, falls zu viel Workload für die verbleibende Zeit bis zur Deadline
    // MVP: Einfach als Dummy-Flag im Payload, könnte später ausgerechnet werden
    const isDoable = true; // In Zukunft: (Total Remaining Minutes < Total Net Time until Deadlines)

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
    today.setHours(0,0,0,0);
    
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
    
    // Deep clone topics state to simulate consumption
    const examStates = exams.map(e => ({
      ...e,
      topics: e.topics.map(t => ({ ...t, remainingDuration: t.expectedDurationMinutes || 60 }))
    }));

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() + dayOffset);
      const dayOfWeek = currentDay.getDay();

      const endOfDay = new Date(currentDay);
      endOfDay.setHours(23,59,59,999);

      // Calc blockers for this day
      let blockedMinutes = 0;
      for (const b of allBlockers) {
        let isBlockingToday = false;
        if (b.dayOfWeek === dayOfWeek) isBlockingToday = true;
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

      // Pass 1: Pinned topics
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
                exam.sichtungsphaseCompleted = true; // Simulate completion
              }
            }
          }
        }
      }

      for (const exam of examStates) {
        if (exam.topics.length === 0) continue;

        let availableTopics = exam.topics.filter(t => t.remainingDuration > 0 && !t.isPinned);
        if (!exam.sichtungsphaseCompleted) {
          const sichtung = availableTopics.find(t => t.isSichtung);
          availableTopics = sichtung ? [sichtung] : [];
        }

        // Filter out topics deferred to a future date
        availableTopics = availableTopics.filter(t => !t.notBefore || t.notBefore <= endOfDay);

        for (const topic of availableTopics) {
          if (timeAllocated < netTimeAvailable) {
            const timeToAllocate = Math.min(topic.remainingDuration, netTimeAvailable - timeAllocated);
            if (timeToAllocate > 0) {
              dailyPlan.push({ ...topic, examName: exam.name, examColor: exam.color, scheduledMinutes: timeToAllocate });
              timeAllocated += timeToAllocate;
              topic.remainingDuration -= timeToAllocate;
              
              if (topic.isSichtung && topic.remainingDuration <= 0) {
                exam.sichtungsphaseCompleted = true; // Simulate completion
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
}
