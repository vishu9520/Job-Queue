import React from 'react';
import type { Job, JobStatus } from '../types/job';
import { JobCard } from './JobCard';
import { Search, Layers } from 'lucide-react';

interface JobListProps {
  jobs: Job[];
  isLoading: boolean;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUpdateStatus: (id: string, status: JobStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSimulateRace: (id: string) => Promise<void>;
  onOpenCreateModal: () => void;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  isLoading,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  onUpdateStatus,
  onDelete,
  onSimulateRace,
  onOpenCreateModal,
}) => {
  const statusTabs = [
    { id: 'all', label: 'All Jobs' },
    { id: 'pending', label: 'Pending' },
    { id: 'running', label: 'Running' },
    { id: 'completed', label: 'Completed' },
    { id: 'failed', label: 'Failed' },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search jobs by title or type..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedStatus === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-44 rounded-xl bg-white border border-slate-200 p-5 animate-pulse flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-3">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-6 bg-slate-100 rounded w-2/3" />
              </div>
              <div className="h-8 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && jobs.length === 0 && (
        <div className="text-center py-16 px-4 rounded-xl bg-white border border-slate-200 shadow-xs my-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No jobs found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {searchQuery || selectedStatus !== 'all'
              ? 'No jobs match your current filter criteria. Try clearing search filters.'
              : 'The queue is currently empty. Get started by creating a new job.'}
          </p>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            + Create First Job
          </button>
        </div>
      )}

      {/* Job Card Grid */}
      {!isLoading && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
              onSimulateRace={onSimulateRace}
            />
          ))}
        </div>
      )}
    </div>
  );
};
