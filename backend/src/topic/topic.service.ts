import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicService {
  constructor(private prisma: PrismaService) {}

  async getBaseDuration(size: string): Promise<number> {
    const settings = await this.prisma.appSettings.findFirst();
    if (!settings) {
      const defaultMap: Record<string, number> = { S: 30, M: 60, L: 120, XL: 240 };
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

  async create(createTopicDto: CreateTopicDto) {
    const expectedDuration = await this.getBaseDuration(createTopicDto.size);
    const exam = await this.prisma.exam.findUnique({ where: { id: createTopicDto.examId } });
    
    let factor = 1.0;
    if (exam) {
      switch (createTopicDto.size) {
        case 'S': factor = exam.velocityFactorS; break;
        case 'M': factor = exam.velocityFactorM; break;
        case 'L': factor = exam.velocityFactorL; break;
        case 'XL': factor = exam.velocityFactorXL; break;
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
        notBefore: createTopicDto.notBefore ? new Date(createTopicDto.notBefore) : null,
        isSichtung: createTopicDto.isSichtung || false,
      },
    });
  }

  async update(id: string, updateTopicDto: UpdateTopicDto) {
    const topic = await this.prisma.topic.findUnique({ where: { id }, include: { exam: true } });
    if (!topic) throw new NotFoundException('Topic not found');

    const isCompleting = updateTopicDto.status === 'COMPLETED' && topic.status !== 'COMPLETED';

    const dataToUpdate: any = { ...updateTopicDto };
    if (updateTopicDto.notBefore !== undefined) {
      dataToUpdate.notBefore = updateTopicDto.notBefore ? new Date(updateTopicDto.notBefore) : null;
    }

    const updated = await this.prisma.topic.update({
      where: { id },
      data: dataToUpdate,
    });

    if (isCompleting && !topic.isSichtung && topic.actualDurationMinutes > 0) {
      // Calculate EMA (Exponential Moving Average)
      const baseDur = await this.getBaseDuration(topic.size);
      const measuredFactor = topic.actualDurationMinutes / baseDur;
      
      // Limit factor to prevent extreme outliers
      const clampedFactor = Math.min(Math.max(measuredFactor, 0.2), 5.0);

      const exam = topic.exam;
      let currentFactor = 1.0;
      switch (topic.size) {
        case 'S': currentFactor = exam.velocityFactorS; break;
        case 'M': currentFactor = exam.velocityFactorM; break;
        case 'L': currentFactor = exam.velocityFactorL; break;
        case 'XL': currentFactor = exam.velocityFactorXL; break;
      }

      // Verzeihende Gewichtung: 30% neues Topic, 70% Historie
      const alpha = 0.3; 
      const newFactor = (alpha * clampedFactor) + ((1 - alpha) * currentFactor);

      const updateData: any = {};
      switch (topic.size) {
        case 'S': updateData.velocityFactorS = newFactor; break;
        case 'M': updateData.velocityFactorM = newFactor; break;
        case 'L': updateData.velocityFactorL = newFactor; break;
        case 'XL': updateData.velocityFactorXL = newFactor; break;
      }

      await this.prisma.exam.update({
        where: { id: exam.id },
        data: updateData
      });

      // Recalculate all TODO/IN_PROGRESS topics for this exam and size
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

  private async recalculateExpectedDurations(examId: string, size: string, newFactor: number, baseDur: number) {
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

  async remove(id: string) {
    return this.prisma.topic.delete({ where: { id } });
  }
}
