import React, { useState } from 'react';
import type { Job, JobStatus } from '../types/job';
import {
  Play,
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
  Zap,
  Tag,
  ShieldCheck,
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  onUpdateStatus: (id: string, status: JobStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSimulateRace: (id: string) => Promise<void>;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onUpdateStatus,
  onDelete,
  onSimulateRace,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSimulatingRace, setIsSimulatingRace] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleStatusChange = async (targetStatus: JobStatus) => {
    try {
      setIsUpdating(true);
      await onUpdateStatus(job.id, targetStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(job.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRaceSim = async () => {
    try {
      setIsSimulatingRace(true);
      await onSimulateRace(job.id);
    } finally {
      setIsSimulatingRace(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Status visual variants
  const getStatusBadge = () => {
    switch (job.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap shrink-0">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>Running</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap shrink-0">
            <XCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
    }
  };

  return (
    <div className="relative group bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition-all shadow-xs hover:shadow-sm flex flex-col justify-between">
      
      {/* Top Details */}
      <div>
        {/* Top Header: Tag on Left, Status Badge on Right with clear separation */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 max-w-[65%] truncate">
            <Tag className="w-3 h-3 text-blue-600 shrink-0" />
            <span className="truncate">{job.type}</span>
          </span>

          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900 tracking-tight leading-snug truncate mb-3" title={job.title}>
          {job.title}
        </h3>

        {/* Metadata Row: Timestamp on Left, ID & Version on Right */}
        <div className="flex items-center justify-between text-xs text-slate-500 py-2 border-y border-slate-100 my-3">
          <span className="flex items-center text-[11px]">
            <Clock className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
            Created {formatDate(job.createdAt)}
          </span>
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400">
            <span title={`Job ID: ${job.id}`}>#{job.id.substring(0, 8)}</span>
            <span>•</span>
            <span>v{job.version}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Controls based on State Machine */}
      <div className="mt-2 pt-1 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          
          {/* Transitions from PENDING */}
          {job.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusChange('running')}
                disabled={isUpdating}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start</span>
              </button>

              <button
                onClick={handleRaceSim}
                disabled={isSimulatingRace}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium shadow-xs transition-colors disabled:opacity-50"
                title="Fires 2 simultaneous requests at the exact same millisecond to test backend atomic lock & 409 conflict!"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Test Race</span>
              </button>
            </>
          )}

          {/* Transitions from RUNNING */}
          {job.status === 'running' && (
            <>
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={isUpdating}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete</span>
              </button>

              <button
                onClick={() => handleStatusChange('failed')}
                disabled={isUpdating}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Fail</span>
              </button>
            </>
          )}

          {/* Terminal state label */}
          {(job.status === 'completed' || job.status === 'failed') && (
            <span className="flex items-center space-x-1 text-[11px] font-mono text-slate-400 italic">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Immutable State</span>
            </span>
          )}
        </div>

        {/* Delete Trigger */}
        {confirmDelete ? (
          <div className="flex items-center space-x-1">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-2.5 py-1 rounded bg-rose-600 text-white text-[11px] font-semibold hover:bg-rose-700 shadow-xs"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[11px] hover:bg-slate-200 border border-slate-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete job"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
};
