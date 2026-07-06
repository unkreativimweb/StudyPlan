import { Module } from '@nestjs/common';
import { BlockerController } from './blocker.controller';
import { BlockerService } from './blocker.service';

@Module({
  controllers: [BlockerController],
  providers: [BlockerService]
})
export class BlockerModule {}
