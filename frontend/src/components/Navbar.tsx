import React from 'react';
import { PlusCircle, RefreshCw, Activity, Cpu } from 'lucide-react';

interface NavbarProps {
  isConnected: boolean;
  onOpenCreateModal: () => void;
  onRefresh: () => void;
  onTriggerWorker: () => void;
  isProcessingWorker: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  isConnected,
  onOpenCreateModal,
  onRefresh,
  onTriggerWorker,
  isProcessingWorker,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Job Queue Dashboard
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  NestJS + React
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Atomic concurrency & state machine orchestration
              </p>
            </div>
          </div>

          {/* Controls & Connection Status */}
          <div className="flex items-center space-x-2.5">
            
            {/* Live Socket Status Dot */}
            <div className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-full text-xs font-medium border ${
              isConnected 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="hidden md:inline">
                {isConnected ? 'Socket Live' : 'Disconnected'}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-300 shadow-xs transition-colors"
              title="Refresh jobs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Trigger Worker Button */}
            <button
              onClick={onTriggerWorker}
              disabled={isProcessingWorker}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs text-xs font-medium transition-colors disabled:opacity-50"
              title="Process next pending job using background worker"
            >
              <Activity className={`w-3.5 h-3.5 text-blue-600 ${isProcessingWorker ? 'animate-spin' : ''}`} />
              <span>Simulate Worker</span>
            </button>

            {/* New Job Modal Button */}
            <button
              onClick={onOpenCreateModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Job</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
