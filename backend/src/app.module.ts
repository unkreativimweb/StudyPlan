import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ExamModule } from './exam/exam.module';
import { TopicModule } from './topic/topic.module';
import { SessionModule } from './session/session.module';
import { BlockerModule } from './blocker/blocker.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [PrismaModule, ExamModule, TopicModule, SessionModule, BlockerModule, SchedulerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
