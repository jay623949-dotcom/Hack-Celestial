'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

/**
 * Enterprise React Error Boundary
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a resilient fallback UI instead of crashing the app.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-rose-300 bg-rose-50/60 p-6 shadow-soft space-y-4 my-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {this.props.fallbackTitle || 'Operational Component Encountered an Issue'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {this.props.fallbackMessage ||
                  'An unexpected rendering error occurred in this operational view. The application remains online and your navigation is preserved.'}
              </p>
              {this.state.error?.message && (
                <div className="mt-2 p-2.5 rounded-lg bg-white/80 border border-rose-200 font-mono text-[11px] text-rose-800 break-words">
                  {this.state.error.message}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-rose-200/80">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
