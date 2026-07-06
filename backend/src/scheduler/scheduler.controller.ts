import { Controller, Get } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get('daily')
  getDailyPlan() {
    return this.schedulerService.getDailyPlan();
  }
}
