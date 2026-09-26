'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip
} from 'recharts';
import {
  Sparkles, TrendingUp, Clock, Bot, CheckCircle2,
  ShieldCheck, AlertTriangle, MessageSquare, Filter, Send
} from 'lucide-react';

// Demo Sparkline Data for KPI Cards
const SPARKLINE_CONFIDENCE = [
  { val: 88 }, { val: 90 }, { val: 91 }, { val: 89 }, { val: 94 }, { val: 96 }, { val: 98.4 }
];
const SPARKLINE_TIME = [
  { val: 8.5 }, { val: 7.2 }, { val: 6.8 }, { val: 5.5 }, { val: 4.8 }, { val: 4.5 }, { val: 4.2 }
];
const SPARKLINE_ACTIONS = [
  { val: 920 }, { val: 1040 }, { val: 1150 }, { val: 1220 }, { val: 1310 }, { val: 1380 }, { val: 1428 }
];

// Demo Radar Data
const RADAR_DATA = [
  { metric: 'Guest Goodwill', score: 98 },
  { metric: 'Revenue Protection', score: 94 },
  { metric: 'Staff Velocity', score: 90 },
  { metric: 'Turnaround Speed', score: 96 },
  { metric: 'Maintenance Safety', score: 92 },
  { metric: 'Inventory Lock', score: 88 },
];

// Odoo Discuss Style AI Feed Messages
const INITIAL_AGENT_MESSAGES = [
  {
    id: 1,
    agent: 'Front Desk Agent',
    initial: 'F',
    avatarBg: 'bg-rose-100 text-rose-700 border-rose-200',
    time: '10:40 AM',
    confidence: '98%',
    message: 'Diamond VIP Alexander Vance arrived 2 hours early at the lobby. Room 401 is unavailable due to an active HVAC repair.',
    accentNote: 'Requires VIP lounge courtesy & room swap to 505',
    department: 'front_desk',
  },
  {
    id: 2,
    agent: 'Maintenance Agent',
    initial: 'M',
    avatarBg: 'bg-amber-100 text-amber-700 border-amber-200',
    time: '10:41 AM',
    confidence: '95%',
    message: 'Room 401 HVAC compressor replacement is in progress. Estimated completion time is 25 minutes. Safety protocols engaged.',
    accentNote: 'Part #CP-401 replaced by Tech Dave',
    department: 'maintenance',
  },
  {
    id: 3,
    agent: 'Housekeeping Agent',
    initial: 'H',
    avatarBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    time: '10:41 AM',
    confidence: '99%',
    message: 'Room 505 vacated at 10:15 AM. Dispatching 2 attendants for 8-minute express turndown and inspection.',
    accentNote: 'Express turndown checklist activated',
    department: 'housekeeping',
  },
  {
    id: 4,
    agent: 'Revenue Agent',
    initial: 'R',
    avatarBg: 'bg-purple-100 text-odoo-purple border-purple-200',
    time: '10:42 AM',
    confidence: '96%',
    message: 'Floor 4 rooms reserved for 2:00 PM wedding group block. Reassigning Vance to Room 505 protects $4,200 ADR group revenue.',
    accentNote: 'Zero yield loss; group block preserved',
    department: 'revenue',
  },
  {
    id: 5,
    agent: 'Consensus Engine',
    initial: 'C',
    avatarBg: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    time: '10:42 AM',
    confidence: '98.4%',
    message: 'Synthesized multi-agent trade-offs. Action Plan: Reassign VIP Vance → Room 505. Offer champagne amenity in lobby lounge.',
    accentNote: 'Duty Manager Approval Authorized',
    department: 'consensus',
  },
];

export default function SwarmAnalyticsDashboard() {
  const [messages, setMessages] = useState(INITIAL_AGENT_MESSAGES);
  const [filterDept, setFilterDept] = useState('all');
  const [newMessageText, setNewMessageText] = useState('');

  const filteredMessages = messages.filter(
    (m) => filterDept === 'all' || m.department === filterDept
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg = {
      id: Date.now(),
      agent: 'Duty Manager (Human)',
      initial: 'DM',
      avatarBg: 'bg-odoo-purple text-white border-odoo-purple',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 'Human Governance',
      message: newMessageText,
      accentNote: 'Manager override instruction logged',
      department: 'consensus',
    };

    setMessages([...messages, newMsg]);
    setNewMessageText('');
  };

  return (
    <div className="w-full space-y-8">
      {/* 01. TOP 3 KPI ANALYTICS CARDS WITH SPARKLINE BACKGROUNDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1: Consensus Confidence */}
        <div className="bg-white rounded-2xl p-6 shadow-odoo border border-border flex flex-col justify-between relative overflow-hidden group hover:shadow-odoo-hover transition-all">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Swarm Consensus Confidence
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                +3.2% vs last shift
              </span>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-foreground tracking-tight">
              98.4%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cross-departmental constraint alignment
            </p>
          </div>

          {/* Background Sparkline Graph */}
          <div className="h-14 w-full mt-4 -mb-2 -mx-2 opacity-80 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SPARKLINE_CONFIDENCE}>
                <defs>
                  <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#017E84" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#017E84" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke="#017E84" strokeWidth={2.5} fill="url(#gradTeal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI 2: Avg Resolution Time */}
        <div className="bg-white rounded-2xl p-6 shadow-odoo border border-border flex flex-col justify-between relative overflow-hidden group hover:shadow-odoo-hover transition-all">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Avg Incident Resolution
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Clock className="w-3 h-3 text-emerald-600" />
                -1.8 min response latency
              </span>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-foreground tracking-tight">
              4.2 <span className="text-lg font-normal text-muted-foreground">min</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Time from telemetry signal to staff dispatch
            </p>
          </div>

          {/* Background Sparkline Graph */}
          <div className="h-14 w-full mt-4 -mb-2 -mx-2 opacity-80 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SPARKLINE_TIME}>
                <defs>
                  <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#714B67" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#714B67" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke="#714B67" strokeWidth={2.5} fill="url(#gradPurple)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI 3: Total Autonomous Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-odoo border border-border flex flex-col justify-between relative overflow-hidden group hover:shadow-odoo-hover transition-all">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Autonomous Actions
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Bot className="w-3 h-3 text-amber-600" />
                +28 actions/hr
              </span>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-foreground tracking-tight">
              1,428
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Work orders &amp; guest notifications dispatched
            </p>
          </div>

          {/* Background Sparkline Graph */}
          <div className="h-14 w-full mt-4 -mb-2 -mx-2 opacity-80 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SPARKLINE_ACTIONS}>
                <defs>
                  <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D97706" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#D97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke="#D97706" strokeWidth={2.5} fill="url(#gradAmber)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 02. MAIN TWO-COLUMN SECTION: DISCUSS FEED + CONFIDENCE RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: ODOO "DISCUSS" STYLE LIVE AGENT FEED (7 COLS) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-odoo border border-border space-y-6">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-odoo-purple" />
                <h3 className="text-lg font-bold text-foreground">
                  AI Swarm Live Debate Feed
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Odoo &ldquo;Discuss&rdquo; style multi-agent reasoning stream
              </p>
            </div>

            {/* Department Filter Tabs */}
            <div className="flex items-center gap-1 bg-surface-secondary p-1 rounded-2xl border border-border text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'front_desk', label: 'Front' },
                { id: 'housekeeping', label: 'Clean' },
                { id: 'maintenance', label: 'Fix' },
                { id: 'revenue', label: 'Yield' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterDept(f.id)}
                  className={`px-2.5 py-1 rounded-xl font-medium transition-all ${
                    filterDept === f.id
                      ? 'bg-odoo-purple text-white shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Bubbles List */}
          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-start gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                {/* Distinct Pastel-Colored Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl border flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${msg.avatarBg}`}
                >
                  {msg.initial}
                </div>

                {/* Clean Rounded Chat Bubble */}
                <div className="flex-1 bg-surface-secondary/70 rounded-2xl p-4 border border-border/60 shadow-sm space-y-1.5 transition-all group-hover:border-gray-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {msg.agent}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {msg.time}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white text-odoo-purple border border-border">
                      Conf: {msg.confidence}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed">
                    {msg.message}
                  </p>

                  {/* Handwritten Accent Font Highlight */}
                  {msg.accentNote && (
                    <div className="pt-1 text-[13px] font-accent font-bold text-odoo-purple flex items-center gap-1">
                      <span>⚡ {msg.accentNote}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Duty Manager Reply Input */}
          <form onSubmit={handleSendMessage} className="pt-2 border-t border-border flex items-center gap-2">
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Inject Duty Manager instruction into swarm..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-surface-secondary border border-border text-xs focus:outline-none focus:border-odoo-purple focus:ring-1 focus:ring-odoo-purple"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl bg-odoo-purple text-white text-xs font-bold hover:bg-odoo-purple/90 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: MINIMAL ODOO CONFIDENCE RADAR CHART (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-odoo border border-border space-y-6">
          <div className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-odoo-teal" />
                <h3 className="text-lg font-bold text-foreground">
                  Consensus Alignment Radar
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-odoo-teal/10 text-odoo-teal border border-odoo-teal/20">
                6-AXIS METRIC
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Balanced operational trade-off evaluation across department priorities
            </p>
          </div>

          {/* Clean Radar Chart with Odoo Purple (#714B67) & Faint Grid */}
          <div className="h-[320px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={RADAR_DATA}>
                {/* Minimal Faint Grid Lines */}
                <PolarGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 600 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Swarm Alignment"
                  dataKey="score"
                  stroke="#714B67"
                  strokeWidth={2.5}
                  fill="#714B67"
                  fillOpacity={0.20}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '1rem',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Metric Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            <div className="p-3 rounded-xl bg-surface-secondary border border-border/60">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                Highest Alignment
              </span>
              <span className="text-sm font-bold text-foreground">Guest Goodwill (98)</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-secondary border border-border/60">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                Trade-off Constraint
              </span>
              <span className="text-sm font-bold text-odoo-purple">Inventory Lock (88)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
