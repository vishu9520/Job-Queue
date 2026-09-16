import { useState, useEffect, useCallback } from 'react';
import type { Job, JobStats, JobStatus, ToastMessage } from './types/job';
import {
  getJobs,
  getStats,
  createJob,
  updateJobStatus,
  deleteJob,
  triggerProcessNext,
  simulateRaceCondition,
  socket,
} from './services/api';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { JobList } from './components/JobList';
import { JobModal } from './components/JobModal';
import { Toast } from './components/Toast';

export function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats>({
    total: 0,
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isProcessingWorker, setIsProcessingWorker] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchJobsAndStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedJobs, fetchedStats] = await Promise.all([
        getJobs(selectedStatus, searchQuery),
        getStats(),
      ]);
      setJobs(fetchedJobs);
      setStats(fetchedStats);
    } catch (err: any) {
      addToast('error', 'API Error', 'Failed to fetch jobs from server.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, searchQuery]);

  useEffect(() => {
    fetchJobsAndStats();
  }, [fetchJobsAndStats]);

  // Socket.io Real-time setup
  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    if (socket.connected) {
      setIsConnected(true);
    }

    const onJobCreated = (newJob: Job) => {
      setJobs((prev) => [newJob, ...prev]);
      getStats().then(setStats);
      addToast('info', 'New Job Added', `Job "${newJob.title}" created via WebSocket.`);
    };

    const onJobUpdated = (updatedJob: Job) => {
      setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
      getStats().then(setStats);
    };

    const onJobDeleted = ({ id }: { id: string }) => {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      getStats().then(setStats);
      addToast('info', 'Job Deleted', `Job record deleted.`);
    };

    const onStatsUpdated = (newStats: JobStats) => {
      setStats(newStats);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('jobCreated', onJobCreated);
    socket.on('jobUpdated', onJobUpdated);
    socket.on('jobDeleted', onJobDeleted);
    socket.on('statsUpdated', onStatsUpdated);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('jobCreated', onJobCreated);
      socket.off('jobUpdated', onJobUpdated);
      socket.off('jobDeleted', onJobDeleted);
      socket.off('statsUpdated', onStatsUpdated);
    };
  }, []);

  const handleCreateJob = async (title: string, type: string) => {
    const newJob = await createJob(title, type);
    addToast('success', 'Job Created', `Job "${newJob.title}" queued successfully.`);
    fetchJobsAndStats();
  };

  const handleUpdateStatus = async (id: string, status: JobStatus) => {
    try {
      const updated = await updateJobStatus(id, status);
      addToast('success', 'Status Updated', `Job moved to '${updated.status}'.`);
      fetchJobsAndStats();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message;
      const title = err.response?.status === 409 ? '409 Concurrency Conflict' : 'Transition Rejected';
      addToast(err.response?.status === 409 ? 'warning' : 'error', title, message);
      fetchJobsAndStats();
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteJob(id);
      addToast('success', 'Job Deleted', 'Job removed successfully.');
      fetchJobsAndStats();
    } catch (err: any) {
      addToast('error', 'Error', 'Failed to delete job.');
    }
  };

  const handleTriggerWorker = async () => {
    try {
      setIsProcessingWorker(true);
      const res = await triggerProcessNext();
      addToast('info', 'Worker Executed', res.message);
      fetchJobsAndStats();
    } catch (err: any) {
      addToast('error', 'Worker Error', err.response?.data?.message || 'Worker failed.');
    } finally {
      setIsProcessingWorker(false);
    }
  };

  const handleSimulateRace = async (id: string) => {
    addToast('info', 'Race Condition Triggered', 'Fired 2 simultaneous status update requests to NestJS...');
    const result = await simulateRaceCondition(id);

    const req1Success = result.req1.status === 'fulfilled';
    const req2Success = result.req2.status === 'fulfilled';

    if (req1Success && req2Success) {
      addToast('warning', 'Both Succeeded', 'Unexpected duplicate execution.');
    } else if (req1Success || req2Success) {
      const rejectedReason = result.req1.status === 'rejected' ? result.req1.reason : result.req2.reason;
      const msg = rejectedReason?.response?.data?.message || 'Concurrent request rejected with 409 Conflict';
      addToast('warning', 'Atomic Concurrency Verified! ⚡', `1 request succeeded. 2nd request caught: "${msg}"`);
    } else {
      addToast('error', 'Both Failed', 'Both requests failed.');
    }

    fetchJobsAndStats();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        isConnected={isConnected}
        onOpenCreateModal={() => setIsModalOpen(true)}
        onRefresh={fetchJobsAndStats}
        onTriggerWorker={handleTriggerWorker}
        isProcessingWorker={isProcessingWorker}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsOverview
          stats={stats}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
        />

        <JobList
          jobs={jobs}
          isLoading={isLoading}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteJob}
          onSimulateRace={handleSimulateRace}
          onOpenCreateModal={() => setIsModalOpen(true)}
        />
      </main>

      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateJob}
      />

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
