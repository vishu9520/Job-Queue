import React from 'react';
import type { JobStats } from '../types/job';
import { Layers, Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface StatsOverviewProps {
  stats: JobStats;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  selectedStatus,
  onSelectStatus,
}) => {
  const cards = [
    {
      id: 'all',
      label: 'Total Jobs',
      count: stats.total,
      icon: Layers,
      iconBg: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'pending',
      label: 'Pending',
      count: stats.pending,
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
    },
    {
      id: 'running',
      label: 'Running',
      count: stats.running,
      icon: Loader2,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/60',
      isSpinning: true,
    },
    {
      id: 'completed',
      label: 'Completed',
      count: stats.completed,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
    },
    {
      id: 'failed',
      label: 'Failed',
      count: stats.failed,
      icon: XCircle,
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/60',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedStatus === card.id;

        return (
          <button
            key={card.id}
            onClick={() => onSelectStatus(card.id)}
            className={`relative p-4 rounded-xl bg-white border transition-all text-left shadow-xs hover:shadow-sm ${
              isSelected 
                ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/20' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.iconBg}`}>
                <Icon className={`w-4 h-4 ${card.isSpinning && card.count > 0 ? 'animate-spin' : ''}`} />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {card.count}
            </div>
          </button>
        );
      })}
    </div>
  );
};
