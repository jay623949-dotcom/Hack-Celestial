'use client';

import React from 'react';
import { 
  Bot, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  Compass, 
  Coins, 
  Wrench, 
  BedDouble, 
  Users 
} from 'lucide-react';

export default function AgentCard({
  name = 'Specialized Agent',
  department = 'operations',
  roleTitle = 'Operational Specialist',
  status = 'IDLE', // 'IDLE' | 'ANALYZING' | 'COMPLETED' | 'ERROR'
  focus = 'Operational context triage',
  observation = null,
  recommendation = null,
  confidence = 0.85,
  affectedRooms = [],
  affectedStaff = [],
  timestamp = null,
  accentColor = 'primary', // 'primary' | 'teal' | 'emerald' | 'amber'
}) {
  // Department icons and subtle accents
  const getDeptConfig = () => {
    switch (department.toLowerCase()) {
      case 'front_desk':
        return {
          icon: Users,
          label: 'Front Desk & VIP Experience',
          border: 'border-border hover:border-primary/40',
          badge: 'bg-primary/10 text-primary border-primary/20',
          lightBg: 'bg-surface',
        };
      case 'housekeeping':
        return {
          icon: BedDouble,
          label: 'Housekeeping & Turnover',
          border: 'border-border hover:border-amber-500/40',
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          lightBg: 'bg-surface',
        };
      case 'maintenance':
        return {
          icon: Wrench,
          label: 'Engineering & Maintenance',
          border: 'border-border hover:border-rose-500/40',
          badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          lightBg: 'bg-surface',
        };
      case 'revenue':
        return {
          icon: Coins,
          label: 'Revenue Management & Inventory',
          border: 'border-border hover:border-emerald-500/40',
          badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          lightBg: 'bg-surface',
        };
      default:
        return {
          icon: Bot,
          label: 'Operational Intelligence',
          border: 'border-border',
          badge: 'bg-surface-secondary text-muted-foreground border-border',
          lightBg: 'bg-surface',
        };
    }
  };

  const deptConfig = getDeptConfig();
  const DeptIcon = deptConfig.icon;

  // Render status badge
  const renderStatus = () => {
    switch (status) {
      case 'ANALYZING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            Analyzing...
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Analysis Complete
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            Analysis Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-muted text-muted-foreground border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
            Standby
          </span>
        );
    }
  };

  return (
    <div
      className={`p-5 rounded-3xl border bg-surface transition-all duration-200 shadow-soft flex flex-col justify-between ${deptConfig.border}`}
    >
      <div>
        {/* Header: Identity & Status */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${deptConfig.badge}`}>
              <DeptIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground tracking-tight flex items-center gap-1.5">
                <span>{name}</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                {deptConfig.label}
              </p>
            </div>
          </div>
          {renderStatus()}
        </div>

        {/* Current Focus */}
        <div className="mt-3.5 pb-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            Operational Focus
          </span>
          <p className="text-xs font-semibold text-foreground mt-0.5">
            {focus}
          </p>
        </div>

        {/* Content Body Based on State */}
        {status === 'ANALYZING' && (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2.5 rounded-2xl bg-surface-secondary/40 border border-border/50">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground font-mono">
              Evaluating departmental constraints...
            </p>
          </div>
        )}

        {status === 'IDLE' && (
          <div className="py-6 text-center text-xs text-muted-foreground/80 rounded-2xl bg-surface-secondary/30 border border-dashed border-border/60">
            Ready to evaluate incoming operational scenario.
          </div>
        )}

        {status === 'ERROR' && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
            Unable to complete analysis. Please verify OpenAI backend configuration.
          </div>
        )}

        {status === 'COMPLETED' && (
          <div className="space-y-3 pt-1">
            {/* Fact-based Observation */}
            {observation && (
              <div className="p-3 rounded-2xl bg-surface-secondary/50 border border-border/60 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Key Observation (Fact)
                </span>
                <p className="text-xs text-foreground leading-relaxed">
                  {observation}
                </p>
              </div>
            )}

            {/* Actionable Proposal (Recommendation) */}
            {recommendation && (
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                    Recommendation Proposal
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Requires Approval
                  </span>
                </div>
                <div className="text-xs font-bold text-foreground">
                  {recommendation.action || recommendation}
                </div>
                {recommendation.reason && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <strong className="text-foreground/90">Reason:</strong> {recommendation.reason}
                  </p>
                )}
                {recommendation.estimated_duration_minutes && (
                  <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 pt-1 border-t border-primary/10">
                    <Clock className="w-3 h-3 text-primary" />
                    Est. Duration: <strong className="text-foreground">{recommendation.estimated_duration_minutes} mins</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Meta: Resources & Confidence */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <div className="flex items-center gap-2">
          {affectedRooms.length > 0 && (
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-primary" />
              {affectedRooms.map((r) => r.replace('room-', '')).join(', ')}
            </span>
          )}
          {affectedStaff.length > 0 && (
            <span className="flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-primary" />
              {affectedStaff.join(', ')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span>Confidence:</span>
          <strong className="text-foreground font-semibold">
            {Math.round(confidence * 100)}%
          </strong>
        </div>
      </div>
    </div>
  );
}
