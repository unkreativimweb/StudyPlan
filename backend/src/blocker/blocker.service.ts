import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlockerDto } from './dto/create-blocker.dto';

@Injectable()
export class BlockerService {
  constructor(private prisma: PrismaService) {}

  async create(createBlockerDto: CreateBlockerDto) {
    return this.prisma.fixedBlocker.create({
      data: {
        title: createBlockerDto.title,
        dayOfWeek: createBlockerDto.dayOfWeek,
        specificDate: createBlockerDto.specificDate ? new Date(createBlockerDto.specificDate) : null,
        startTime: createBlockerDto.startTime,
        endTime: createBlockerDto.endTime,
      }
    });
  }

  async findAll() {
    return this.prisma.fixedBlocker.findMany();
  }

  async remove(id: string) {
    return this.prisma.fixedBlocker.delete({ where: { id } });
  }
}
