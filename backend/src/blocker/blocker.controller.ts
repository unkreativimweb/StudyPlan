import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { BlockerService } from './blocker.service';
import { CreateBlockerDto } from './dto/create-blocker.dto';

@Controller('blockers')
export class BlockerController {
  constructor(private readonly blockerService: BlockerService) {}

  @Post()
  create(@Body() createBlockerDto: CreateBlockerDto) {
    return this.blockerService.create(createBlockerDto);
  }

  @Get()
  findAll() {
    return this.blockerService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blockerService.remove(id);
  }
}
