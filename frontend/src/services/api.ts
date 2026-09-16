import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import type { Job, JobStats, JobStatus } from '../types/job';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Socket.io initialization
export const socket: Socket = io(API_BASE_URL, {
  autoConnect: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const getJobs = async (status?: string, search?: string): Promise<Job[]> => {
  const params: Record<string, string> = {};
  if (status && status !== 'all') params.status = status;
  if (search && search.trim() !== '') params.search = search;
  const response = await api.get<Job[]>('/jobs', { params });
  return response.data;
};

export const getStats = async (): Promise<JobStats> => {
  const response = await api.get<JobStats>('/jobs/stats');
  return response.data;
};

export const createJob = async (title: string, type: string): Promise<Job> => {
  const response = await api.post<Job>('/jobs', { title, type });
  return response.data;
};

export const updateJobStatus = async (id: string, status: JobStatus): Promise<Job> => {
  const response = await api.patch<Job>(`/jobs/${id}/status`, { status });
  return response.data;
};

export const deleteJob = async (id: string): Promise<{ message: string; id: string }> => {
  const response = await api.delete<{ message: string; id: string }>(`/jobs/${id}`);
  return response.data;
};

export const triggerProcessNext = async (): Promise<{ message: string; job?: Job }> => {
  const response = await api.post<{ message: string; job?: Job }>('/jobs/process-next');
  return response.data;
};

/**
 * Simulates two concurrent requests hitting the backend at the exact same millisecond
 * to demonstrate atomic concurrency handling (optimistic locking / SQL state checks).
 */
export const simulateRaceCondition = async (id: string): Promise<{
  req1: { status: 'fulfilled' | 'rejected'; value?: Job; reason?: any };
  req2: { status: 'fulfilled' | 'rejected'; value?: Job; reason?: any };
}> => {
  const req1Promise = updateJobStatus(id, 'running');
  const req2Promise = updateJobStatus(id, 'running');

  const [req1, req2] = await Promise.allSettled([req1Promise, req2Promise]);

  return { req1, req2 };
};
