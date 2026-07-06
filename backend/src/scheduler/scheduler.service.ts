import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulerService {
  constructor(private prisma: PrismaService) {}

  async getDailyPlan() {
    const weekly = await this.getWeeklyPlan();
    return weekly[0];
  }

  async getWeeklyPlan() {
    const today = new Date();
    
    // For calculation of "Today's" exact remaining time
    const currentNowMinutes = today.getHours() * 60 + today.getMinutes();
    
    const settings = await this.prisma.appSettings.findFirst();
    const buffer = settings?.dailyBufferMinutes || 60;

    const allBlockers = await this.prisma.fixedBlocker.findMany();
    const exams = await this.prisma.exam.findMany({
      include: {
        topics: {
          where: { status: { in: ['TODO', 'IN_PROGRESS'] } },
          orderBy: { order: 'asc' }
        }
      }
    });

    const weeklySchedule = [];
    
    // Deep clone topics state to simulate consumption across the week
    const examStates = exams.map(e => ({
      ...e,
      topics: e.topics.map(t => ({ ...t, remainingDuration: t.expectedDurationMinutes || 60 }))
    }));

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDay = new Date(today);
      currentDay.setDate(today.getDate() + dayOffset);
      currentDay.setHours(0,0,0,0);
      
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
          const bStart = (startH * 60) + startM;
          const bEnd = (endH * 60) + endM;
          
          if (dayOffset === 0) {
             // It's today. Only count blockers that haven't fully passed yet.
             if (bEnd <= currentNowMinutes) continue;
             const overlapStart = Math.max(currentNowMinutes, bStart);
             blockedMinutes += (bEnd - overlapStart);
          } else {
             blockedMinutes += (bEnd - bStart);
          }
        }
      }

      let netTimeAvailable = 0;
      if (dayOffset === 0) {
        const minutesLeftToday = (24 * 60) - currentNowMinutes;
        netTimeAvailable = Math.max(0, minutesLeftToday - blockedMinutes - buffer);
      } else {
        netTimeAvailable = Math.max(0, (24 * 60) - blockedMinutes - buffer);
      }

      const dailyPlan = [];
      let timeAllocated = 0;

      // Pass 1: Pinned topics (manual overrides for today only)
      if (dayOffset === 0) {
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
      }

      // Pass 2: Interleaved Queue Scheduling
      let allEligibleTopics: any[] = [];
      for (const exam of examStates) {
        if (exam.topics.length === 0) continue;

        let availableTopics = exam.topics.filter(t => t.remainingDuration > 0 && !t.isPinned);
        
        if (!exam.sichtungsphaseCompleted) {
          const sichtung = availableTopics.find(t => t.isSichtung);
          availableTopics = sichtung ? [sichtung] : [];
        }

        // Filter out deferred tasks
        availableTopics = availableTopics.filter(t => !t.notBefore || t.notBefore <= endOfDay);

        // Calculate score (Internal deadline = 2 days before actual deadline)
        const internalDeadline = new Date(exam.deadline);
        internalDeadline.setDate(internalDeadline.getDate() - 2);
        const daysUntil = (internalDeadline.getTime() - currentDay.getTime()) / (1000 * 60 * 60 * 24);

        availableTopics.forEach((topic) => {
          const topicIndex = topic.order > 0 ? topic.order : exam.topics.findIndex(t => t.id === topic.id);
          const score = daysUntil + (topicIndex * 2.0); // 2.0 is the Interleave Weight
          
          allEligibleTopics.push({
            ...topic,
            examName: exam.name,
            examColor: exam.color,
            score,
            examRef: exam
          });
        });
      }

      // Lower score = higher priority
      allEligibleTopics.sort((a, b) => a.score - b.score);

      for (const topic of allEligibleTopics) {
        if (timeAllocated < netTimeAvailable) {
          const timeToAllocate = Math.min(topic.remainingDuration, netTimeAvailable - timeAllocated);
          if (timeToAllocate > 0) {
            // Push without examRef to avoid huge payloads
            const { examRef, ...topicPayload } = topic;
            dailyPlan.push({ ...topicPayload, scheduledMinutes: timeToAllocate });
            timeAllocated += timeToAllocate;
            
            // Deduct from state
            const originalTopic = topic.examRef.topics.find((t: any) => t.id === topic.id);
            if (originalTopic) {
               originalTopic.remainingDuration -= timeToAllocate;
               if (originalTopic.isSichtung && originalTopic.remainingDuration <= 0) {
                 topic.examRef.sichtungsphaseCompleted = true; 
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
        plan: dailyPlan,
        isDoable: true // MVP flag
      });
    }

    return weeklySchedule;
  }
}
