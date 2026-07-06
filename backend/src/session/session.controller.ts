import { Controller, Post, Body, Param, Patch } from '@nestjs/common';
import { SessionService } from './session.service';
import { StartSessionDto } from './dto/start-session.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('start')
  start(@Body() startSessionDto: StartSessionDto) {
    return this.sessionService.startSession(startSessionDto.topicId);
  }

  @Patch(':id/stop')
  stop(@Param('id') id: string) {
    return this.sessionService.stopSession(id);
  }
}
