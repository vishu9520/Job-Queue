import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { JobsGateway } from './jobs.gateway';
import { JobStatus } from './job-status.enum';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('JobsService', () => {
  let service: JobsService;
  let prisma: PrismaService;
  let gateway: JobsGateway;

  const mockJob = {
    id: 'test-uuid-1',
    title: 'Test Email Job',
    type: 'email',
    status: JobStatus.PENDING,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    job: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockJobsGateway = {
    notifyJobCreated: jest.fn(),
    notifyJobUpdated: jest.fn(),
    notifyJobDeleted: jest.fn(),
    notifyStatsUpdated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JobsGateway, useValue: mockJobsGateway },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    prisma = module.get<PrismaService>(PrismaService);
    gateway = module.get<JobsGateway>(JobsGateway);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new job with PENDING status', async () => {
      mockPrismaService.job.create.mockResolvedValue(mockJob);
      mockPrismaService.job.findMany.mockResolvedValue([mockJob]);

      const dto = { title: 'Test Email Job', type: 'email' };
      const result = await service.create(dto);

      expect(result.status).toEqual(JobStatus.PENDING);
      expect(mockPrismaService.job.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Email Job',
          type: 'email',
          status: JobStatus.PENDING,
        },
      });
      expect(mockJobsGateway.notifyJobCreated).toHaveBeenCalledWith(mockJob);
    });
  });

  describe('updateStatus - State Machine Validation', () => {
    it('should allow valid transition: pending -> running', async () => {
      const pendingJob = { ...mockJob, status: JobStatus.PENDING };
      const runningJob = { ...mockJob, status: JobStatus.RUNNING, version: 2 };

      mockPrismaService.job.findUnique.mockResolvedValueOnce(pendingJob);
      mockPrismaService.job.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.job.findUnique.mockResolvedValueOnce(runningJob);
      mockPrismaService.job.findMany.mockResolvedValue([runningJob]);

      const updated = await service.updateStatus('test-uuid-1', JobStatus.RUNNING);

      expect(updated.status).toBe(JobStatus.RUNNING);
      expect(mockPrismaService.job.updateMany).toHaveBeenCalledWith({
        where: { id: 'test-uuid-1', status: JobStatus.PENDING },
        data: { status: JobStatus.RUNNING, version: { increment: 1 } },
      });
    });

    it('should reject invalid transition: pending -> completed', async () => {
      const pendingJob = { ...mockJob, status: JobStatus.PENDING };
      mockPrismaService.job.findUnique.mockResolvedValue(pendingJob);

      await expect(
        service.updateStatus('test-uuid-1', JobStatus.COMPLETED)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject transition out of terminal state: completed -> running', async () => {
      const completedJob = { ...mockJob, status: JobStatus.COMPLETED };
      mockPrismaService.job.findUnique.mockResolvedValue(completedJob);

      await expect(
        service.updateStatus('test-uuid-1', JobStatus.RUNNING)
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle concurrency collision and throw ConflictException', async () => {
      const pendingJob = { ...mockJob, status: JobStatus.PENDING };
      const concurrentlyChangedJob = { ...mockJob, status: JobStatus.RUNNING };

      // 1. Initial find returns pending
      mockPrismaService.job.findUnique.mockResolvedValueOnce(pendingJob);
      // 2. updateMany returns count 0 (another request changed it first!)
      mockPrismaService.job.updateMany.mockResolvedValue({ count: 0 });
      // 3. Re-fetch returns updated running status
      mockPrismaService.job.findUnique.mockResolvedValueOnce(concurrentlyChangedJob);

      await expect(
        service.updateStatus('test-uuid-1', JobStatus.RUNNING)
      ).rejects.toThrow(ConflictException);
    });
  });
});
