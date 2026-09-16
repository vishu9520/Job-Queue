export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// State transition rules matrix:
// pending -> running -> completed or failed
export const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  [JobStatus.PENDING]: [JobStatus.RUNNING],
  [JobStatus.RUNNING]: [JobStatus.COMPLETED, JobStatus.FAILED],
  [JobStatus.COMPLETED]: [], // Terminal state - no transitions allowed
  [JobStatus.FAILED]: [],    // Terminal state - no transitions allowed
};

export const REQUIRED_PRIOR_STATUS: Record<JobStatus, JobStatus[]> = {
  [JobStatus.PENDING]: [],
  [JobStatus.RUNNING]: [JobStatus.PENDING],
  [JobStatus.COMPLETED]: [JobStatus.RUNNING],
  [JobStatus.FAILED]: [JobStatus.RUNNING],
};
