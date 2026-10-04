import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { SseService } from './sse.service';

@Module({
  controllers: [JobsController],
  providers: [JobsService, SseService],
  exports: [JobsService],
})
export class JobsModule {}
