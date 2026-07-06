import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamService {
  constructor(private prisma: PrismaService) {}

  async create(createExamDto: CreateExamDto) {
    // Wenn ein neues Fach erstellt wird, erstellen wir sofort auch die Sichtungsphase!
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
        size: 'S', // Default size for Sichtung
        status: 'TODO',
        isSichtung: true,
        order: -1, // Immer ganz oben
        expectedDurationMinutes: 30, // Schätzung für initiales Zerlegen
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

  async findOne(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: { 
        topics: {
          orderBy: { order: 'asc' }
        } 
      },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async update(id: string, updateExamDto: UpdateExamDto) {
    const data: any = { ...updateExamDto };
    if (updateExamDto.deadline) {
      data.deadline = new Date(updateExamDto.deadline);
    }
    return this.prisma.exam.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.exam.delete({
      where: { id },
    });
  }
}
