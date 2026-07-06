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

    // Priorisiere nach Deadline
    exams.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

    for (const exam of exams) {
      if (exam.topics.length === 0) continue;

      let availableTopics = [];
      
      // Sichtungsphase-Blocker Logik
      if (!exam.sichtungsphaseCompleted) {
        availableTopics = exam.topics.filter(t => t.isSichtung);
      } else {
        availableTopics = exam.topics.filter(t => !t.isSichtung);
      }

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
}
