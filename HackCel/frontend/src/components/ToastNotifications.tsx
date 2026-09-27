import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Info, Sparkles, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'alert' | 'info';
  timestamp: string;
}

interface ToastNotificationsProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastNotifications: React.FC<ToastNotificationsProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          alert: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />,
          info: <Sparkles className="w-5 h-5 text-teal-400 shrink-0" />,
        };

        const colors = {
          success: 'border-emerald-500/40 bg-slate-900/95 text-emerald-200 shadow-emerald-500/10',
          warning: 'border-amber-500/40 bg-slate-900/95 text-amber-200 shadow-amber-500/10',
          alert: 'border-rose-500/40 bg-slate-900/95 text-rose-200 shadow-rose-500/10',
          info: 'border-teal-500/40 bg-slate-900/95 text-teal-200 shadow-teal-500/10',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-lg shadow-xl transition-all duration-300 animate-slide-in ${colors[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold font-mono tracking-wide uppercase text-white">
                  {toast.title}
                </h4>
                <span className="text-[10px] font-mono text-slate-400">{toast.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
