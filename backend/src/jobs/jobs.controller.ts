import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Sse,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, map } from 'rxjs';
import { JobsService } from './jobs.service';
import { SseService } from './sse.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly sseService: SseService,
  ) {}

  /**
   * SSE endpoint — frontend connects here to receive real-time job events.
   * GET /jobs/events
   * Replaces Socket.io — works on Vercel serverless.
   */
  @Sse('events')
  sse(@Res() res: Response): Observable<MessageEvent> {
    // Keep connection alive with periodic heartbeat
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 25000);

    res.on('close', () => clearInterval(heartbeat));

    return this.sseService.stream$.pipe(
      map(({ type, data }) => ({
        type,
        data: JSON.stringify(data),
      } as MessageEvent)),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.jobsService.findAll(status, search);
  }

  @Get('stats')
  getStats() {
    return this.jobsService.getStats();
  }

  @Post('process-next')
  processNext() {
    return this.jobsService.processNextPendingJob();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateJobStatusDto: UpdateJobStatusDto,
  ) {
    return this.jobsService.updateStatus(id, updateJobStatusDto.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }
}
