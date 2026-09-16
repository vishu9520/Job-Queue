import React, { useState } from 'react';
import { X, Send, FileText } from 'lucide-react';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, type: string) => Promise<void>;
}

const PRESET_TYPES = [
  { value: 'email_notification', label: 'Email Notification' },
  { value: 'data_export', label: 'Data Export (CSV/PDF)' },
  { value: 'image_processing', label: 'Image Processing' },
  { value: 'report_generation', label: 'Report Generation' },
  { value: 'payroll_sync', label: 'Payroll Sync' },
];

export const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('email_notification');
  const [customType, setCustomType] = useState('');
  const [useCustomType, setUseCustomType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a job title.');
      return;
    }

    const finalType = useCustomType ? customType.trim() : type;
    if (!finalType) {
      setError('Please specify a job type.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(title.trim(), finalType);
      setTitle('');
      setCustomType('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Create New Job</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1.5">
              Job Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Send Weekly Digest Emails"
              maxLength={100}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm transition-colors"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider">
                Job Type
              </label>
              <button
                type="button"
                onClick={() => setUseCustomType(!useCustomType)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {useCustomType ? 'Select from list' : '+ Custom type'}
              </button>
            </div>

            {useCustomType ? (
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="e.g. video_transcoding"
                maxLength={50}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm transition-colors"
              />
            ) : (
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm transition-colors"
              >
                {PRESET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} ({t.value})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs disabled:opacity-50 active:scale-[0.98]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Creating...' : 'Create Job'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
