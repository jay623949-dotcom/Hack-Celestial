'use client';

import React, { useState } from 'react';
import { Activity, ShieldCheck, ChevronDown, ChevronRight, Filter, Trash2, Radio } from 'lucide-react';

export default function LiveEventBusFeed({ events = [], isConnected = false, onClear = () => {} }) {
  const [filter, setFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  const eventTypes = ['ALL', 'GUEST_CHECKED_IN', 'SENTIMENT_ALERT', 'ROOM_READY_ETA_UPDATED', 'MAINTENANCE_REQUIRED', 'COST_INCIDENT_LOGGED', 'PERISHABLE_FLASH_SALE', 'NET_REVPAR_UPDATED'];

  const filteredEvents = filter === 'ALL'
    ? events
    : events.filter((e) => (e.event || e.event_type) === filter);

  const getEventBadgeColor = (type) => {
    switch (type) {
      case 'GUEST_CHECKED_IN': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'SENTIMENT_ALERT': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'ROOM_READY_ETA_UPDATED': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'MAINTENANCE_REQUIRED': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'COST_INCIDENT_LOGGED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'NET_REVPAR_UPDATED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'PERISHABLE_FLASH_SALE': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Cross-Agent Event Bus &amp; Live Real-Time Stream</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                isConnected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {isConnected ? 'ONLINE (SOCKET.IO)' : 'DISCONNECTED'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Autonomous pub/sub broadcast channel streaming operational agent events in real time.
            </p>

          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-border bg-surface-secondary text-foreground focus:outline-none"
          >
            {eventTypes.map((t) => (
              <option key={t} value={t}>{t === 'ALL' ? 'All Events' : t}</option>
            ))}
          </select>

          <button
            onClick={onClear}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg border border-border hover:bg-surface-secondary transition-colors"
            title="Clear event logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-xs font-mono">
          Awaiting live event broadcasts. Trigger check-in, CV image triage, or click "Run Rehearsal Cascade".
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filteredEvents.map((ev, idx) => {
            const eventName = ev.event || ev.event_type || 'SYSTEM_EVENT';
            const isExpanded = expandedId === idx;
            const time = ev.timestamp || new Date().toLocaleTimeString();
            const payload = ev.payload || ev.data || {};

            return (
              <div
                key={idx}
                className="rounded-lg border border-border bg-surface-secondary/40 p-3 text-xs transition-colors hover:bg-surface-secondary"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : idx)}
                  className="flex items-center justify-between cursor-pointer gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getEventBadgeColor(eventName)}`}>
                      {eventName}
                    </span>
                    <span className="truncate text-foreground font-medium">
                      {payload.reason || payload.reasoning || payload.message || payload.description || 'Payload delivered'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                    {time}
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-border/60">
                    <pre className="p-2 rounded bg-black/60 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48">
                      {JSON.stringify(payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
