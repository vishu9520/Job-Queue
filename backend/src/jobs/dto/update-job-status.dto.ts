import { IsEnum, IsNotEmpty } from 'class-validator';
import { JobStatus } from '../job-status.enum';

export class UpdateJobStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(JobStatus, {
    message: `Status must be one of the following: ${Object.values(JobStatus).join(', ')}`,
  })
  status: JobStatus;
}
