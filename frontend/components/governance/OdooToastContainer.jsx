'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, X, Sparkles } from 'lucide-react';

export default function OdooToastContainer({ toasts = [], onCloseToast = () => {} }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-3 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success' || !toast.type;
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white rounded-2xl p-4 shadow-odoo border border-gray-200 flex items-start gap-3.5 text-xs hover:shadow-odoo-hover transition-all animate-in slide-in-from-bottom-3 duration-200"
          >
            {/* Small Colored Icon Badge */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isSuccess
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : isWarning
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              {isSuccess && <CheckCircle2 className="w-4 h-4" />}
              {isWarning && <AlertTriangle className="w-4 h-4" />}
              {isError && <AlertCircle className="w-4 h-4" />}
            </div>

            {/* Crisp Text & Mini Module Layout */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground truncate">
                  {toast.title}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono ml-2 shrink-0">
                  {toast.time || 'Just now'}
                </span>
              </div>

              <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">
                {toast.message}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => onCloseToast(toast.id)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
