import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async startSession(topicId: string) {
    const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) throw new NotFoundException('Topic not found');
    
    // Check if there is already a running session for this topic
    const running = await this.prisma.sessionTrack.findFirst({
      where: { topicId, endTime: null }
    });
    if (running) throw new BadRequestException('Session already running for this topic');

    // Update topic status to IN_PROGRESS if it's TODO
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

  async stopSession(sessionId: string) {
    const session = await this.prisma.sessionTrack.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.endTime) throw new BadRequestException('Session already stopped');

    const endTime = new Date();
    const durationMs = endTime.getTime() - session.startTime.getTime();
    const durationMinutes = Math.max(durationMs / 1000 / 60, 0); // Convert to minutes

    const updatedSession = await this.prisma.sessionTrack.update({
      where: { id: sessionId },
      data: {
        endTime,
        durationMinutes
      }
    });

    // Update topic actualDurationMinutes
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
}
