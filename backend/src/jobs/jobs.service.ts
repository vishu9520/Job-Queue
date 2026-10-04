import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JobStatus, ALLOWED_TRANSITIONS } from './job-status.enum';
import { SseService } from './sse.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sseService: SseService,
  ) {}

  async create(createJobDto: CreateJobDto) {
    const job = await this.prisma.job.create({
      data: {
        title: createJobDto.title.trim(),
        type: createJobDto.type.trim(),
        status: JobStatus.PENDING,
      },
    });

    this.sseService.emit('jobCreated', job);
    await this.broadcastStats();
    return job;
  }

  async findAll(status?: string, search?: string) {
    const where: any = {};

    if (status && status !== 'all') {
      if (!Object.values(JobStatus).includes(status as JobStatus)) {
        throw new BadRequestException(
          `Invalid status filter '${status}'. Allowed values are: all, ${Object.values(JobStatus).join(', ')}.`,
        );
      }
      where.status = status;
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search } },
        { type: { contains: search } },
      ];
    }

    return this.prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job with ID '${id}' not found`);
    }
    return job;
  }

  async getStats() {
    const jobs = await this.prisma.job.findMany({
      select: { status: true },
    });

    const stats = {
      total: jobs.length,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
    };

    for (const job of jobs) {
      if (job.status in stats) {
        stats[job.status as keyof typeof stats]++;
      }
    }

    return stats;
  }

  private async broadcastStats() {
    const stats = await this.getStats();
    this.sseService.emit('statsUpdated', stats);
  }

  /**
   * Updates job status while enforcing strict state machine transitions
   * and handling real-world concurrency (race conditions).
   */
  async updateStatus(id: string, targetStatus: JobStatus) {
    // 1. Fetch current job state to check existence & state machine rules
    const existingJob = await this.findOne(id);
    const currentStatus = existingJob.status as JobStatus;

    // Check if transition is valid according to state machine matrix
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      if (currentStatus === targetStatus) {
        throw new BadRequestException(
          `Job '${id}' is already in status '${targetStatus}'.`
        );
      }

      if (currentStatus === JobStatus.COMPLETED || currentStatus === JobStatus.FAILED) {
        throw new BadRequestException(
          `Cannot change status of a '${currentStatus}' job. '${currentStatus}' is a terminal state.`
        );
      }

      throw new BadRequestException(
        `Invalid status transition: '${currentStatus}' -> '${targetStatus}'. Allowed transitions from '${currentStatus}' are: [${allowed.join(', ')}].`
      );
    }

    // 2. Perform ATOMIC update with optimistic concurrency control.
    // We condition the update on id AND the expected current status!
    // If another request changed the status concurrently (e.g., from 'pending' to 'running'),
    // this update query will match 0 rows and return count = 0.
    const result = await this.prisma.job.updateMany({
      where: {
        id,
        status: currentStatus, // Atomic lock check!
      },
      data: {
        status: targetStatus,
        version: { increment: 1 },
      },
    });

    if (result.count === 0) {
      // Race condition detected! Another concurrent request modified the job.
      const freshJob = await this.prisma.job.findUnique({ where: { id } });
      this.logger.warn(
        `Concurrency collision on job ${id}. Attempted transition: ${currentStatus} -> ${targetStatus}, but actual status is now ${freshJob?.status}`
      );

      throw new ConflictException(
        `Concurrency conflict: Job status was updated to '${freshJob?.status}' by another request while processing.`
      );
    }

    // Retrieve fresh updated job record
    const updatedJob = await this.prisma.job.findUnique({ where: { id } });
    if (!updatedJob) {
      throw new NotFoundException(`Job with ID '${id}' not found after update`);
    }

    this.sseService.emit('jobUpdated', updatedJob);
    await this.broadcastStats();

    return updatedJob;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.job.delete({ where: { id } });

    this.sseService.emit('jobDeleted', { id });
    await this.broadcastStats();

    return { message: `Job '${id}' successfully deleted`, id };
  }

  /**
   * Process next pending job automatically (Simulated Queue Execution Engine)
   */
  async processNextPendingJob() {
    const pendingJob = await this.prisma.job.findFirst({
      where: { status: JobStatus.PENDING },
      orderBy: { createdAt: 'asc' },
    });

    if (!pendingJob) {
      return { message: 'No pending jobs in queue' };
    }

    // Transition pending -> running
    const runningJob = await this.updateStatus(pendingJob.id, JobStatus.RUNNING);

    // Simulate work, then randomly complete or fail
    setTimeout(async () => {
      try {
        const outcomes = [JobStatus.COMPLETED, JobStatus.COMPLETED, JobStatus.COMPLETED, JobStatus.FAILED];
        const finalStatus = outcomes[Math.floor(Math.random() * outcomes.length)];
        await this.updateStatus(runningJob.id, finalStatus);
      } catch (err) {
        this.logger.error(`Error processing background job ${runningJob.id}`, err);
      }
    }, 3000);

    return { message: `Started execution of job '${runningJob.id}'`, job: runningJob };
  }
}
