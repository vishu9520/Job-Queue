import React from 'react';
import type { ToastMessage } from '../types/job';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        let borderAccent = 'border-l-4 border-l-blue-600';
        let Icon = Info;
        let iconColor = 'text-blue-600 bg-blue-50';

        if (t.type === 'success') {
          borderAccent = 'border-l-4 border-l-emerald-600';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-600 bg-emerald-50';
        } else if (t.type === 'error') {
          borderAccent = 'border-l-4 border-l-rose-600';
          Icon = XCircle;
          iconColor = 'text-rose-600 bg-rose-50';
        } else if (t.type === 'warning') {
          borderAccent = 'border-l-4 border-l-amber-500';
          Icon = AlertTriangle;
          iconColor = 'text-amber-600 bg-amber-50';
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start p-3.5 rounded-xl border border-slate-200 bg-white shadow-lg transition-all duration-300 ${borderAccent}`}
          >
            <div className={`p-1.5 rounded-lg mr-3 mt-0.5 ${iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 pr-2">
              <h4 className="text-xs font-semibold text-slate-900 mb-0.5">
                {t.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {t.message}
              </p>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
