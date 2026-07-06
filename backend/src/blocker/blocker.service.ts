import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlockerDto } from './dto/create-blocker.dto';
import { UpdateBlockerDto } from './dto/update-blocker.dto';

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

  async update(id: string, updateBlockerDto: UpdateBlockerDto) {
    const data: any = { ...updateBlockerDto };
    if (updateBlockerDto.specificDate) {
      data.specificDate = new Date(updateBlockerDto.specificDate);
    }
    return this.prisma.fixedBlocker.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.fixedBlocker.delete({
      where: { id },
    });
  }
}
