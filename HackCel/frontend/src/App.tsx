import React, { useState, useCallback } from 'react';
import { useEventStream, ServerEvent } from './hooks/useEventStream';
import { Navigation, PageId } from './components/Navigation';
import { ToastNotifications, ToastItem } from './components/ToastNotifications';
import { OverviewPage } from './pages/OverviewPage';
import { FrontDeskPage } from './pages/FrontDeskPage';
import { HousekeepingPage } from './pages/HousekeepingPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { RevenuePage } from './pages/RevenuePage';
import { LoggedEvent } from './components/EventBusLog';
import {
  INITIAL_GUESTS,
  INITIAL_HOUSEKEEPING_TASKS,
  INITIAL_WORK_ORDERS,
} from './data/benchmarks';
import {
  FlashSaleOffer,
  GuestRecord,
  HousekeepingTask,
  RevenueMetric,
  WorkOrderRecord,
} from './types/schemas';
import { apiPost } from './lib/api';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');

  // Core Application Operational State
  const [guests, setGuests] = useState<GuestRecord[]>(INITIAL_GUESTS);
  const [workOrders, setWorkOrders] = useState<WorkOrderRecord[]>(INITIAL_WORK_ORDERS);
  const [lockedRooms, setLockedRooms] = useState<string[]>(['Suite 502']);
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>(
    INITIAL_HOUSEKEEPING_TASKS
  );
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetric>({
    baseRevPAR: 385.0,
    currentNetRevPAR: 368.5,
    totalCostIncidentsDelta: -1850.0,
    activeFlashSalesCount: 1,
    projectedRecoveredYield: 195.0,
  });
  const [costDeduction, setCostDeduction] = useState<number>(1850.0);

  // Toast notifications & Event log
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [eventLogs, setEventLogs] = useState<LoggedEvent[]>([
    {
      id: 'evt-init-1',
      timestamp: '10:42 AM',
      eventType: 'MAINTENANCE_CV_RESULT',
      targetService: 'Maintenance & Safety',
      data: {
        event_type: 'MAINTENANCE_CV_RESULT',
        room_id: 'Suite 502',
        confidence_score: 0.96,
        requires_human_review: false,
        severity: 'safety',
        reasoning: 'High water volume rupture adjacent to drywall cavity mandates immediate lockout.',
      },
      uiActionsCount: 1,
    },
    {
      id: 'evt-init-2',
      timestamp: '10:45 AM',
      eventType: 'COST_INCIDENT_SUMMARY',
      targetService: 'Revenue Net RevPAR',
      data: {
        event_type: 'COST_INCIDENT_SUMMARY',
        estimated_cost_impact: 1850.0,
        affects_room_ids: ['Suite 502'],
        reasoning: 'Cost impact of $1,850 reflected in Net RevPAR operating margin.',
      },
      uiActionsCount: 1,
    },
  ]);

  const [isResetting, setIsResetting] = useState(false);
  const [isCascading, setIsCascading] = useState(false);

  const addToast = (title: string, message: string, type: ToastItem['type'] = 'info') => {
    const newToast: ToastItem = {
      id: `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 4));
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Real-time SSE Stream Event Handler
  const handleServerEvent = useCallback((serverEvent: ServerEvent) => {
    const eventType = serverEvent.event || serverEvent.event_type || 'SYSTEM_EVENT';
    const newLog: LoggedEvent = {
      id: `evt-sse-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      eventType: eventType,
      targetService: 'Live SSE Event Stream',
      data: (serverEvent.payload || serverEvent) as any,
      uiActionsCount: (serverEvent.payload && serverEvent.payload.ui_actions?.length) || 0,
    };
    setEventLogs((prev) => [newLog, ...prev]);

    // Update operational state on live events
    if (eventType === 'TEST_PING') {
      addToast('REST + SSE Wire Verification', 'Test ping received live from FastAPI backend!', 'success');
    } else if (eventType === 'GUEST_CHECKED_IN' || eventType === 'GUEST_INTAKE_RESULT') {
      addToast('Front Desk Check-In', 'Guest profile intake extracted & assigned.', 'info');
    } else if (eventType === 'MAINTENANCE_REQUIRED' || eventType === 'MAINTENANCE_CV_RESULT') {
      const room = serverEvent.payload?.room_id || 'Suite 502';
      addToast('Maintenance Safety Alert', `CV Triage triggered room lockout on ${room}!`, 'alert');
      setLockedRooms((prev) => Array.from(new Set([...prev, room])));
    } else if (eventType === 'NET_REVPAR_UPDATED' || eventType === 'COST_INCIDENT_SUMMARY') {
      const ded = serverEvent.payload?.cost_deduction || serverEvent.payload?.estimated_cost_impact || 1850;
      setCostDeduction(ded);
      setRevenueMetrics((prev) => ({
        ...prev,
        currentNetRevPAR: prev.baseRevPAR - (ded / 100),
      }));
      addToast('Net RevPAR Recalculated', `Operational cost deduction -${ded} applied to margin.`, 'warning');
    } else if (eventType === 'PERISHABLE_FLASH_SALE' || eventType === 'FLASH_SALE_OFFER') {
      addToast('Flash Sale Activated', 'Persona-matched AI marketing offers broadcasted.', 'success');
    }
  }, []);

  const { isConnected } = useEventStream(handleServerEvent);

  // Demo Reset Trigger
  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await apiPost('/demo/reset');
      setGuests(INITIAL_GUESTS);
      setWorkOrders(INITIAL_WORK_ORDERS);
      setLockedRooms(['Suite 502']);
      setHousekeepingTasks(INITIAL_HOUSEKEEPING_TASKS);
      setRevenueMetrics({
        baseRevPAR: 385.0,
        currentNetRevPAR: 368.5,
        totalCostIncidentsDelta: -1850.0,
        activeFlashSalesCount: 1,
        projectedRecoveredYield: 195.0,
      });
      setCostDeduction(1850.0);
      addToast('Demo Reset Completed', 'Resort database & state re-seeded to initial benchmark state.', 'info');
    } catch (err: any) {
      console.error('Reset error:', err);
      addToast('Demo Reset Error', err.message, 'alert');
    } finally {
      setIsResetting(false);
    }
  };

  // 1-Click Demo Cascade Execution
  const handleTriggerDemoCascade = async () => {
    setIsCascading(true);
    addToast('Demo Cascade Triggered', 'Executing Check-in → Maintenance → Net RevPAR → Flash Sale cascade...', 'info');

    try {
      // 1. Reset
      await apiPost('/demo/reset');

      // 2. Check-in
      await apiPost('/api/frontdesk/checkin', {
        name: 'Alexandra Chen',
        reservation_id: 'RES-9901',
        room_id: 1,
        transcript: 'My flight was delayed 5 hours, luggage lost. Need quiet room for 9am keynote speech.',
      });
      addToast('Step 1: Front Desk Intake', 'VIP At-Risk guest checked in.', 'warning');

      // 3. Maintenance Triage
      await apiPost('/api/maintenance/diagnostics/image-triage', {
        room_id: 4,
        description: 'Charlotte Pipe 1-inch CPVC Coupling rupture in ceiling',
      });
      setLockedRooms((prev) => Array.from(new Set([...prev, 'Suite 502'])));
      addToast('Step 2: Maintenance CV Triage', 'Emergency lockout initiated on Suite 502.', 'alert');

      // 4. Revenue Deduction
      const revRes = await apiPost<any>('/api/revenue/net-revpar');
      const deduction = revRes?.cost_deduction || 1850;
      setCostDeduction(deduction);
      setRevenueMetrics((prev) => ({
        ...prev,
        currentNetRevPAR: prev.baseRevPAR - deduction / 100,
      }));
      addToast('Step 3: Revenue Deduction', `Net RevPAR recalculated with -$${deduction} cost impact.`, 'warning');

      // 5. Flash Sale
      await apiPost('/api/revenue/flash-sale', {
        asset_description: 'Oceanfront Private Cabana #3',
        expiry_minutes: 60,
        price: 79,
        offer_type: 'flash_sale',
      });
      addToast('Step 4: Flash Sale Broadcast', 'Persona AI flash sale created to recover Net RevPAR yield!', 'success');

    } catch (err: any) {
      console.error('Cascade error:', err);
      addToast('Cascade Execution Warning', 'Cascade step ran with local state simulation.', 'warning');
    } finally {
      setIsCascading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      
      {/* Persistent Navigation Header */}
      <Navigation
        activePage={activePage}
        onPageChange={setActivePage}
        isConnected={isConnected}
        netRevPAR={revenueMetrics.currentNetRevPAR}
        costDeduction={costDeduction}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Main Multi-Page Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activePage === 'overview' && (
          <OverviewPage
            netRevPAR={revenueMetrics.currentNetRevPAR}
            costDeduction={costDeduction}
            guests={guests}
            workOrders={workOrders}
            housekeepingTasks={housekeepingTasks}
            eventLogs={eventLogs}
            onTriggerDemoCascade={handleTriggerDemoCascade}
            isCascading={isCascading}
            onSelectPage={setActivePage}
          />
        )}

        {activePage === 'frontdesk' && (
          <FrontDeskPage
            guests={guests}
            onGuestAdded={(newGuest) => setGuests((prev) => [newGuest, ...prev])}
          />
        )}

        {activePage === 'housekeeping' && (
          <HousekeepingPage
            tasks={housekeepingTasks}
            lockedRooms={lockedRooms}
            onTaskCompleted={(roomId) =>
              setHousekeepingTasks((prev) =>
                prev.map((t) => (t.room_id === roomId ? { ...t, status: 'Cleaned' } : t))
              )
            }
          />
        )}

        {activePage === 'maintenance' && (
          <MaintenancePage
            workOrders={workOrders}
            lockedRooms={lockedRooms}
            onWorkOrderAdded={(newOrder) => setWorkOrders((prev) => [newOrder, ...prev])}
            onLockRoom={(roomId) => setLockedRooms((prev) => Array.from(new Set([...prev, roomId])))}
          />
        )}

        {activePage === 'revenue' && (
          <RevenuePage
            revenueMetrics={revenueMetrics}
            costDeduction={costDeduction}
            guests={guests}
            onFlashSaleCreated={() =>
              setRevenueMetrics((prev) => ({
                ...prev,
                activeFlashSalesCount: prev.activeFlashSalesCount + 1,
                projectedRecoveredYield: prev.projectedRecoveredYield + 79,
              }))
            }
          />
        )}
      </main>

      {/* Toast Notification Container */}
      <ToastNotifications toasts={toasts} onDismiss={handleDismissToast} />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs font-mono text-slate-500">
        Smart Resort 360 • Multi-Agent Resort Operating System • Hackathon Live Demo
      </footer>

    </div>
  );
}
