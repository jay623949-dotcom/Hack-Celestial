'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardShell from '../../../../components/dashboard/DashboardShell';
import {
  Play, CheckCircle2, Clock, AlertTriangle, ShieldCheck,
  RotateCw, ArrowLeft, Users, BedDouble, Wrench, Radio,
  Activity, Check, Pause, ArrowRight, CornerDownRight,
  Sparkles, Layers, ChevronRight, AlertCircle, RefreshCw, HelpCircle
} from 'lucide-react';
import HelpDocsModal from '../../../../components/common/HelpDocsModal';
import { useRole } from '../../../../lib/roleContext';
import {
  getActionPlan,
  getExecutionState,
  getExecutionTimeline,
  executeActionPlan,
  updateTaskStatus
} from '../../../../lib/api';
import { getSocket, joinExecutionRoom } from '../../../../lib/socket';

const DEPT_BADGES = {
  housekeeping: { label: 'Housekeeping', icon: BedDouble, badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  maintenance:  { label: 'Maintenance',  icon: Wrench,    badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  front_desk:   { label: 'Front Desk',   icon: Users,     badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  revenue:      { label: 'Revenue',      icon: Radio,     badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  operations:   { label: 'Operations',   icon: Layers,    badge: 'bg-slate-50 text-slate-700 border-slate-200' },
};

const STATUS_CONFIG = {
  dispatched:  { label: 'Dispatched',  color: 'bg-blue-50 text-blue-700 border-blue-200' },
  accepted:    { label: 'Accepted',    color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  in_progress: { label: 'In Progress', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed:   { label: 'Completed',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  blocked:     { label: 'Blocked',     color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function ActionPlanExecutionPage() {
  const params = useParams();
  const router = useRouter();
  const { role, roleData } = useRole();

  const planId = params?.actionPlanId || 'plan-vip-arrival';

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [plan, setPlan] = useState(null);
  const [execution, setExecution] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const timelineContainerRef = useRef(null);

  // Synchronize state from API (source of truth)
  const syncStateFromApi = useCallback(async () => {
    try {
      setErrorMsg(null);
      const [planRes, execRes, timeRes] = await Promise.all([
        getActionPlan(planId).catch(() => null),
        getExecutionState(planId).catch(() => null),
        getExecutionTimeline(planId).catch(() => null),
      ]);

      if (planRes?.data) setPlan(planRes.data);
      if (execRes?.data) setExecution(execRes.data);
      if (timeRes?.data?.timeline) setTimeline(timeRes.data.timeline);
    } catch (err) {
      console.warn('[Sync API Error]', err.message);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  // Initial load
  useEffect(() => {
    syncStateFromApi();
  }, [syncStateFromApi]);

  // Socket.IO real-time event listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleConnect = () => {
      setSocketConnected(true);
      joinExecutionRoom(planId);
      // Resynchronize on reconnect
      syncStateFromApi();
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    if (socket.connected) {
      setSocketConnected(true);
      joinExecutionRoom(planId);
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Live Execution & Task Events
    const handleExecutionStarted = (data) => {
      if (data.action_plan_id === planId) {
        syncStateFromApi();
      }
    };

    const handleTaskEvent = (data) => {
      if (data.action_plan_id === planId) {
        // Optimistically update tasks list
        setExecution((prev) => {
          if (!prev) return prev;
          const currentTasks = prev.tasks ? [...prev.tasks] : [];
          const idx = currentTasks.findIndex((t) => t.id === data.task_id);
          if (idx !== -1) {
            currentTasks[idx] = { ...currentTasks[idx], status: data.status, updated_at: data.updated_at };
          }
          const completedCount = currentTasks.filter((t) => t.status === 'completed').length;
          return {
            ...prev,
            tasks: currentTasks,
            completed_tasks: completedCount,
            progress_pct: currentTasks.length > 0 ? Math.round((completedCount / currentTasks.length) * 100) : 0,
            status: completedCount === currentTasks.length && currentTasks.length > 0 ? 'completed' : prev.status,
          };
        });

        // Append to timeline
        const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setTimeline((prev) => [
          ...prev,
          {
            id: `live-${Date.now()}`,
            event_type: `task.${data.status}`,
            title: `${data.title || 'Task'} → ${data.status?.toUpperCase()}`,
            description: `Task status updated to ${data.status}.`,
            department: data.department,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    };

    const handleExecutionCompleted = (data) => {
      if (data.action_plan_id === planId) {
        setExecution((prev) => (prev ? { ...prev, status: 'completed' } : prev));
        syncStateFromApi();
      }
    };

    socket.on('execution.started', handleExecutionStarted);
    socket.on('task.dispatched', handleTaskEvent);
    socket.on('task.accepted', handleTaskEvent);
    socket.on('task.in_progress', handleTaskEvent);
    socket.on('task.completed', handleTaskEvent);
    socket.on('task.blocked', handleTaskEvent);
    socket.on('execution.completed', handleExecutionCompleted);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('execution.started', handleExecutionStarted);
      socket.off('task.dispatched', handleTaskEvent);
      socket.off('task.accepted', handleTaskEvent);
      socket.off('task.in_progress', handleTaskEvent);
      socket.off('task.completed', handleTaskEvent);
      socket.off('task.blocked', handleTaskEvent);
      socket.off('execution.completed', handleExecutionCompleted);
    };
  }, [planId, syncStateFromApi]);

  // Trigger Execution manually if approved but not yet dispatched
  const handleTriggerExecution = async () => {
    try {
      setActionInProgress(true);
      setErrorMsg(null);
      await executeActionPlan(planId, {
        actorId: roleData?.email || 'admin@resort360.demo',
        actorRole: role || 'admin',
      });
      await syncStateFromApi();
    } catch (err) {
      setErrorMsg(err.message || 'Execution initiation failed');
    } finally {
      setActionInProgress(false);
    }
  };

  // Advance Task Status (for interactive demo)
  const handleAdvanceTask = async (taskId, nextStatus) => {
    try {
      setActionInProgress(true);
      await updateTaskStatus(taskId, nextStatus);
      await syncStateFromApi();
    } catch (err) {
      setErrorMsg(err.message || `Failed to update task to ${nextStatus}`);
    } finally {
      setActionInProgress(false);
    }
  };

  const tasks = execution?.tasks || [];
  const completedTasks = execution?.completed_tasks || 0;
  const totalTasks = execution?.total_tasks || tasks.length || 0;
  const progressPct = execution?.progress_pct || (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <Link href="/dashboard" className="hover:text-slate-800">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/dashboard/consensus" className="hover:text-slate-800">Consensus</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold">Live Operational Execution</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Socket Connection Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
              socketConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{socketConnected ? 'Live Socket.IO' : 'Reconnecting...'}</span>
            </div>

            <HelpDocsModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} currentPath="/dashboard/execution" />

            <button
              onClick={() => setHelpOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#714B67]/10 border border-[#714B67]/30 text-[#714B67] rounded-lg text-xs font-bold hover:bg-[#714B67] hover:text-white transition-colors shadow-xs"
              title="Execution Engine Documentation & Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#714B67]" />
              <span>Help &amp; Guide</span>
            </button>

            <button
              onClick={syncStateFromApi}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Header Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {plan?.title || 'Operational Execution Engine'}
                </h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {planId}
                </span>
                {execution ? (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase font-mono border ${
                    execution.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : execution.status === 'running'
                      ? 'bg-[#714B67]/15 text-[#714B67] border border-[#714B67]/30'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {execution.status === 'running' ? '● Dispatched & Running' : execution.status}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase font-mono bg-slate-100 text-slate-600 border border-slate-200">
                    {plan?.status || 'Awaiting Execution'}
                  </span>
                )}
              </div>
              <p className="text-xs text-primary font-mono font-semibold tracking-wide">
                Approved → Dispatched → In Progress → Resolved
              </p>
              <p className="text-sm text-slate-600">
                {plan?.description || 'Approved multi-agent consensus translated into active operational tasks across Housekeeping, Maintenance, and Front Desk.'}
              </p>
            </div>

            {/* Trigger execution button if plan is approved but execution not started */}
            {!execution && plan?.status === 'approved' && (
              <button
                onClick={handleTriggerExecution}
                disabled={actionInProgress}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#714B67] hover:bg-[#5D3D55] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>Initialize Task Dispatch</span>
              </button>
            )}
          </div>

          {/* Execution Progress Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#714B67]" />
                <span>Overall Execution Progress</span>
              </span>
              <span className="font-mono text-slate-900 font-bold">
                {completedTasks} of {totalTasks} Tasks Completed ({progressPct}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#714B67] h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 2-Column Operational Execution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Executable Tasks Board (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Dispatched Operational Tasks ({tasks.length})
                </h2>
                <p className="text-xs text-slate-500">Live task progression with real-time room and staff state cascades</p>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-slate-700">No active operational tasks dispatched yet.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Once the manager approves the action plan, the execution engine translates each approved item into a dispatched task.
                </p>
                {plan?.status === 'approved' && (
                  <button
                    onClick={handleTriggerExecution}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#714B67] hover:bg-[#5D3D55] text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Dispatch Approved Tasks Now</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, idx) => {
                  const dept = DEPT_BADGES[task.department] || DEPT_BADGES.operations;
                  const DeptIcon = dept.icon;
                  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.dispatched;

                  return (
                    <div
                      key={task.id || idx}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded">
                              {task.id}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${dept.badge}`}>
                              <DeptIcon className="w-3 h-3" />
                              <span>{dept.label}</span>
                            </span>
                            {task.priority && (
                              <span className={`text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${
                                task.priority === 'urgent' || task.priority === 'high'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {task.priority}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                            {task.title || task.description}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border uppercase font-mono ${statusCfg.color}`}>
                          {task.status === 'completed' && <Check className="w-3 h-3" />}
                          {task.status === 'in_progress' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                          <span>{statusCfg.label}</span>
                        </span>
                      </div>

                      {/* Operational Context Metadata */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        {task.assigned_to && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Staff: <strong className="text-slate-800">{task.assigned_to}</strong></span>
                          </div>
                        )}
                        {task.room_id && (
                          <div className="flex items-center gap-1.5">
                            <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                            <span>Room: <strong className="text-slate-800">{task.room_id}</strong></span>
                          </div>
                        )}
                        {task.guest_id && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Guest: <strong className="text-slate-800">{task.guest_id}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Interactive Demo Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[11px] text-slate-400 font-mono">
                          Traceable to: {task.action_plan_id || planId}
                        </span>

                        <div className="flex items-center gap-2">
                          {task.status === 'dispatched' && (
                            <button
                              onClick={() => handleAdvanceTask(task.id, 'accepted')}
                              disabled={actionInProgress}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-xs font-medium transition-colors"
                            >
                              Staff Accept
                            </button>
                          )}

                          {(task.status === 'dispatched' || task.status === 'accepted') && (
                            <button
                              onClick={() => handleAdvanceTask(task.id, 'in_progress')}
                              disabled={actionInProgress}
                              className="px-2.5 py-1 bg-[#714B67] hover:bg-[#5D3D55] text-white rounded text-xs font-medium transition-colors shadow-sm"
                            >
                              Start Task
                            </button>
                          )}

                          {task.status === 'in_progress' && (
                            <>
                              <button
                                onClick={() => handleAdvanceTask(task.id, 'blocked')}
                                disabled={actionInProgress}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-medium transition-colors"
                              >
                                Block
                              </button>
                              <button
                                onClick={() => handleAdvanceTask(task.id, 'completed')}
                                disabled={actionInProgress}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors shadow-sm flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Complete</span>
                              </button>
                            </>
                          )}

                          {task.status === 'blocked' && (
                            <button
                              onClick={() => handleAdvanceTask(task.id, 'in_progress')}
                              disabled={actionInProgress}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-medium transition-colors"
                            >
                              Resume Task
                            </button>
                          )}

                          {task.status === 'completed' && (
                            <span className="text-xs font-mono font-medium text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified Operational</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Live Execution Timeline & Operational State (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Operational State Changes Overview */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#714B67]" />
                <span>Operational State Changes</span>
              </h2>

              <div className="space-y-3 text-xs">
                {/* Room State */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between font-medium text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-violet-600" />
                      <span>Room 205 (Executive Suite)</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      completedTasks > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {completedTasks > 0 ? 'Ready / Clean' : 'Turnover In Progress'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Housekeeping priority accelerated for Diamond VIP Vance arrival.
                  </p>
                </div>

                {/* Staff Workload */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between font-medium text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Staff 07 (Housekeeping)</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      execution?.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {execution?.status === 'completed' ? 'Available' : 'Busy (On-Task)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Workload state dynamically recalculated upon task completion.
                  </p>
                </div>

                {/* Incident Status */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between font-medium text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-orange-600" />
                      <span>Suite 401 HVAC Incident</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      tasks.find(t => t.department === 'maintenance')?.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {tasks.find(t => t.department === 'maintenance')?.status === 'completed' ? 'Resolved' : 'Active Work Order'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Engineering diagnostic and compressor inspection dispatched.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Operational Timeline (Database Backed) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#714B67]" />
                  <span>Execution Timeline ({timeline.length})</span>
                </h2>
                <span className="text-[10px] font-mono text-slate-400">Database-backed</span>
              </div>

              {timeline.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">No timeline events recorded yet.</p>
              ) : (
                <div
                  ref={timelineContainerRef}
                  className="space-y-3 max-h-[460px] overflow-y-auto pr-1"
                >
                  {timeline.map((evt, idx) => {
                    const timeStr = evt.created_at
                      ? new Date(evt.created_at).toLocaleTimeString('en-US', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : '--:--:--';

                    return (
                      <div key={evt.id || idx} className="flex gap-3 text-xs">
                        <div className="flex flex-col items-center">
                          <span className="w-2 h-2 rounded-full bg-[#714B67] shrink-0 mt-1" />
                          {idx !== timeline.length - 1 && <span className="w-0.5 h-full bg-slate-200 my-0.5" />}
                        </div>
                        <div className="space-y-0.5 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-400">{timeStr}</span>
                            <span className="font-semibold text-slate-800">{evt.title}</span>
                          </div>
                          {evt.description && (
                            <p className="text-[11px] text-slate-500 leading-normal">{evt.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
