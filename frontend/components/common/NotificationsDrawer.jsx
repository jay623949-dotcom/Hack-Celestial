'use client';

import React from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  CloudSun,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function NotificationsDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  const NOTIFICATIONS = [
    {
      id: 'notif-1',
      title: 'Critical Incident: Suite 401 AC Failure',
      detail: 'Compressor burnt out. VIP Alexander Vance arriving early. Alternative Suite 505 recommended.',
      time: '2 mins ago',
      type: 'incident',
      link: '/dashboard',
    },
    {
      id: 'notif-2',
      title: 'Weather Digital Twin: Monsoon Cloudburst Warning',
      detail: 'Open-Meteo reports 45mm/h precipitation. Airport transit delay risk elevated to 78%.',
      time: '14 mins ago',
      type: 'weather',
      link: '/dashboard/weather-digital-twin',
    },
    {
      id: 'notif-3',
      title: 'Autonomous Multi-Agent Consensus Ready',
      detail: 'Front Desk, Housekeeping, Maintenance, and Revenue reached unanimous agreement on action plan.',
      time: '25 mins ago',
      type: 'consensus',
      link: '/dashboard/consensus',
    },
    {
      id: 'notif-4',
      title: 'Housekeeping Express Clean Dispatched',
      detail: 'Attendants deployed to priority queue for Suite 505 VIP turnaround.',
      time: '38 mins ago',
      type: 'task',
      link: '/dashboard/rooms',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-gray-900">Operational Notifications</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
              4 New
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {NOTIFICATIONS.map((n) => (
            <Link
              key={n.id}
              href={n.link}
              onClick={onClose}
              className="block p-3 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all text-xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    n.type === 'incident'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : n.type === 'weather'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}
                >
                  {n.type}
                </span>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {n.time}
                </span>
              </div>
              <div className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                {n.title}
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{n.detail}</p>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            Mark all read
          </button>
        </div>
      </div>
    </div>
  );
}
