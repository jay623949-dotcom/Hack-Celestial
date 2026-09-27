'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import {
  Bot, Sparkles, Play, RefreshCw, AlertCircle, CheckCircle2,
  AlertTriangle, ShieldAlert, Users, BedDouble, Wrench, TrendingUp,
  Clock, Zap, CheckSquare, XCircle, Info, ArrowRight, Layers,
  UserCheck, ShieldCheck, Edit3, ThumbsUp, ThumbsDown, History,
  FileText, CornerDownRight, Check, HelpCircle, RotateCcw, Eye, X
} from 'lucide-react';
import HelpDocsModal from '../../../components/common/HelpDocsModal';
import { useRole } from '../../../lib/roleContext';
import {
  getActionPlan,
  approveActionPlan,
  rejectActionPlan,
  modifyActionPlan,
  updateActionItemStatus,
  resetActionPlan,
  getActionPlanAuditTrail,
  analyzeWithNugen,
  getNugenStatus
} from '../../../lib/api';

const SCENARIOS = [
  {
    id: 'vip_arrival',
    planId: 'plan-vip-arrival',
    eventId: 'EVENT #INC-401-AC',
    label: 'VIP Early Arrival — Room 401 AC Failure',
    tag: 'Primary Demo',
    priority: 'CRITICAL',
    priorityColor: 'text-rose-600',
    priorityBg: 'bg-rose-100 text-rose-800 border-rose-200',
    rooms: 'Room 401, 205',
    guest: 'Arjun Mehta (VIP)',
    desc: 'VIP guest Arjun Mehta arrived 2 hours early (14:00, expected 16:00) while assigned Room 401 has an active AC compressor failure. Four operational departments require immediate coordination.',
    time: '14:00 IST',
    aiSummary: 'Keep Room 401 blocked for AC repair, prepare alternative Room 205 (Deluxe) for VIP guest Arjun Mehta, escort the guest to the Private Club Lounge with beverage service via Amit Shah, and assign technician Rohan Mehta to inspect the Room 401 AC compressor.',
    justification: {
      rootCause: 'Assigned Room 401 air conditioner has failed and cannot be handed over. Technician Rohan Mehta is on standby to diagnose and execute repairs.',
      priorityImpact: 'Arjun Mehta has VIP priority status with a 2-night stay. Waiting time in the lobby must be minimized through lounge hospitality and fast reassignment.',
      inventoryMatch: 'Alternative Room 205 (Deluxe) is available on Floor 2. Priya Sharma is available to perform priority preparation and inspection.',
    },
    perspectives: [
      {
        dept: 'front_desk',
        obs: 'VIP Arjun Mehta waiting in lobby. Room 401 is unavailable due to AC compressor failure.',
        rec: 'Reassign to alternative Deluxe Room 205; escort guest to Private Club Lounge immediately.',
      },
      {
        dept: 'housekeeping',
        obs: 'Room 205 is clean & available. Attendant Priya Sharma available on Floor 2 for express touch-up.',
        rec: 'Prioritize Room 205 for immediate preparation & white-glove inspection before reassignment.',
      },
      {
        dept: 'maintenance',
        obs: 'Room 401 AC compressor failure. Room must remain strictly offline until repair is verified.',
        rec: 'Keep Room 401 blocked; assign technician Rohan Mehta to diagnose compressor and replace capacitor.',
      },
      {
        dept: 'revenue',
        obs: '82% hotel occupancy. Deluxe category inventory is limited today across all channels.',
        rec: 'Moving VIP to Room 205 consumes inventory; hold from general OTA pool to prevent overbooking.',
      },
    ],
    agreements: [
      'Suite 401 must remain strictly blocked and offline until Engineering confirms ambient temperature drops below 72°F.',
      'VIP guest Arjun Mehta cannot be kept waiting in lobby without escalated service recovery in Club Lounge.',
      'Front Desk will notify Housekeeping immediately upon VIP entry to Club Lounge to synchronize key handover.',
    ],
    conflict: {
      title: 'Revenue Management vs Front Desk Reassignment',
      revenue: 'Prefers keeping Room 205 open for same-day unconstrained OTA walk-in at peak ADR (₹24,000).',
      frontDesk: 'Recommends assigning Room 205 directly to Diamond VIP Mehta to prevent high-value guest churn.',
      resolution: 'Manager Resolution: Approving this plan endorses Front Desk priority over same-day retail sale.',
    },
    impact: {
      guest: { title: 'High Positive', desc: 'Eliminates lobby wait; VIP lounge amenity provided.' },
      ops: { title: '1 Attendant Allocated', desc: 'Priya Sharma assigned 20m express preparation.' },
      revenue: { title: 'Protected ADR', desc: 'Protects ₹48,000 VIP reservation value.' },
      resource: { title: '2 Staff Active', desc: 'Front desk escort + HVAC technician.' },
      risk: { title: 'Low Risk', desc: 'Alternative standard inventory remains for afternoon arrivals.' },
    },
    defaultPlan: {
      id: 'plan-vip-arrival',
      status: 'pending_review',
      summary: 'Keep Room 401 blocked for AC repair, prepare alternative Deluxe Room 205 via Priya Sharma, escort VIP Arjun Mehta to lounge via Amit Shah, and dispatch Rohan Mehta for AC repair.',
      items: [
        {
          id: 'item-vip-1',
          description: 'Prepare and inspect Room 205 (Deluxe) for VIP guest reassignment',
          department: 'housekeeping',
          assigned_staff: 'Priya Sharma',
          room_id: 'room-205',
          priority: 'high',
          status: 'pending_review',
          estimated_duration_minutes: 25,
        },
        {
          id: 'item-vip-2',
          description: 'Escort VIP Arjun Mehta to Private Club Lounge with complimentary beverage service',
          department: 'front_desk',
          assigned_staff: 'Amit Shah',
          room_id: 'room-205',
          priority: 'critical',
          status: 'pending_review',
          estimated_duration_minutes: 10,
        },
        {
          id: 'item-vip-3',
          description: 'Inspect Room 401 AC compressor, diagnose failure, and execute repair',
          department: 'maintenance',
          assigned_staff: 'Rohan Mehta',
          room_id: 'room-401',
          priority: 'critical',
          status: 'pending_review',
          estimated_duration_minutes: 45,
        },
        {
          id: 'item-vip-4',
          description: 'Protect Deluxe inventory and hold Room 205 from OTA channels pending VIP check-in',
          department: 'revenue',
          assigned_staff: 'Sunita Rao',
          room_id: 'room-205',
          priority: 'medium',
          status: 'pending_review',
          estimated_duration_minutes: 5,
        },
      ],
    },
  },
  {
    id: 'multiple_incidents',
    planId: 'plan-multiple-incidents',
    eventId: 'EVENT #CASCADE-04',
    label: 'Multiple Active Incidents & Turnover Squeeze',
    tag: 'Crisis Cascade',
    priority: 'CRITICAL',
    priorityColor: 'text-rose-600',
    priorityBg: 'bg-rose-100 text-rose-800 border-rose-200',
    rooms: 'Suite 401, 505, 105',
    guest: 'Alexander Vance & Inbound Guests',
    desc: 'Simultaneous AC compressor breakdown in Suite 401, dirty alternative Suite 505, commercial laundry linen delay, and 2:00 PM check-in surge.',
    time: '12:30 IST',
    aiSummary: 'Reassign VIP Alexander Vance to Suite 505 with 25m express clean by attendant Maria Santos, dispatch Bob Miller for Suite 401 capacitor replacement, and preserve Floor 4 group block integrity.',
    justification: {
      rootCause: 'Simultaneous mechanical breakdown in Suite 401 coincides with 2:00 PM check-in surge and linen turnover squeeze.',
      priorityImpact: 'Diamond VIP Vance tolerance threshold is 10 minutes in lobby. Immediate suite reallocation required.',
      inventoryMatch: 'Suite 505 is dirty but structurally sound. 25-minute expedited turnover clears it for immediate occupancy.',
    },
    perspectives: [
      {
        dept: 'front_desk',
        obs: 'Alexander Vance in lobby; check-in queue building toward 2:00 PM rush.',
        rec: 'Offer private executive transfer to Suite 505 with welcome champagne amenity.',
      },
      {
        dept: 'housekeeping',
        obs: 'Suite 505 needs 25m express clean. Attendant Maria Santos available on Floor 5.',
        rec: 'Divert Maria Santos from routine turndown to priority 25m express clean on Suite 505.',
      },
      {
        dept: 'maintenance',
        obs: 'Suite 401 compressor capacitor blown; part in stock in engineering workshop.',
        rec: 'Dispatch HVAC lead Bob Miller immediately to replace 45uF capacitor in Suite 401.',
      },
      {
        dept: 'revenue',
        obs: 'Floor 4 rooms 402-415 locked for 50-person wedding arrival at 14:00.',
        rec: 'Strictly prohibit assigning Floor 4 rooms to walk-ins to preserve wedding block contract.',
      },
    ],
    agreements: [
      'Suite 401 remains strictly out of inventory until capacitor replacement and ambient check pass.',
      'Wedding group block on Floor 4 remains protected and untouched for 14:00 arrival.',
      'VIP Alexander Vance lobby wait is strictly capped under 10 minutes.',
    ],
    conflict: {
      title: 'Housekeeping Labor Allocation vs Wedding Turnaround',
      revenue: 'Demands all 12 Floor 4 rooms be turned simultaneously before 14:00 wedding arrival.',
      frontDesk: 'Demands attendant Maria Santos be pulled immediately for VIP Suite 505 express clean.',
      resolution: 'Manager Resolution: Priority granted to VIP Suite 505 clean; wedding rooms handled in 2-person batch.',
    },
    impact: {
      guest: { title: 'Resolved VIP', desc: 'Suite 505 upgrade prevents diamond member churn.' },
      ops: { title: 'Express Clean', desc: 'Maria Santos completes 25m expedited turnover.' },
      revenue: { title: 'Block Protected', desc: 'Floor 4 group block preserved with 0 penalty.' },
      resource: { title: '3 Teams Synced', desc: 'HVAC repair + express clean + VIP escort.' },
      risk: { title: 'Medium Risk', desc: 'Tight timeline on Floor 4 wedding room completion.' },
    },
    defaultPlan: {
      id: 'plan-multiple-incidents',
      status: 'pending_review',
      summary: 'Reassign VIP Alexander Vance to Suite 505 with 25m express clean by attendant Maria Santos, dispatch Bob Miller for Suite 401 capacitor replacement, and preserve Floor 4 group block.',
      items: [
        {
          id: 'item-mi-1',
          description: 'Deploy 25m express cleaning on Suite 505 by Maria Santos for VIP reassignment',
          department: 'housekeeping',
          assigned_staff: 'Maria Santos',
          room_id: 'room-505',
          priority: 'critical',
          status: 'pending_review',
          estimated_duration_minutes: 25,
        },
        {
          id: 'item-mi-2',
          description: 'Dispatch HVAC lead Bob Miller for Suite 401 compressor capacitor diagnosis & swap',
          department: 'maintenance',
          assigned_staff: 'Bob Miller',
          room_id: 'room-401',
          priority: 'critical',
          status: 'pending_review',
          estimated_duration_minutes: 30,
        },
        {
          id: 'item-mi-3',
          description: 'Escort VIP Alexander Vance to Private Club Lounge with amenity courtesy service',
          department: 'front_desk',
          assigned_staff: 'Sarah Jenkins',
          room_id: 'room-505',
          priority: 'high',
          status: 'pending_review',
          estimated_duration_minutes: 10,
        },
        {
          id: 'item-mi-4',
          description: 'Preserve Floor 4 rooms 402-415 block integrity for 14:00 wedding group arrival',
          department: 'revenue',
          assigned_staff: 'Chloe Bennett',
          room_id: 'floor-4',
          priority: 'medium',
          status: 'pending_review',
          estimated_duration_minutes: 5,
        },
      ],
    },
  },
  {
    id: 'group_arrival',
    planId: 'plan-group-arrival',
    eventId: 'EVENT #GRP-SUMMIT',
    label: 'Large Group Check-in & Inventory Lock',
    tag: 'Logistics Surge',
    priority: 'HIGH',
    priorityColor: 'text-amber-600',
    priorityBg: 'bg-amber-100 text-amber-800 border-amber-200',
    rooms: 'Floor 4 (Rooms 402–415)',
    guest: '50-Guest Wedding Group',
    desc: '50-guest corporate summit arriving across 12 Floor 4 rooms requiring batch check-in while lobby queue capacity is capped at 4 simultaneous guests.',
    time: '13:00 IST',
    aiSummary: 'Activate North Ballroom batch check-in satellite desk for 50-guest wedding party, inspect Floor 4 rooms, pre-stage luggage, and verify master folio settlement.',
    justification: {
      rootCause: '50 guests arriving simultaneously on chartered motorcoaches will overwhelm main front desk 4-station capacity.',
      priorityImpact: 'Prevents standard transient guest queue bottleneck and ensures synchronized room key distribution.',
      inventoryMatch: 'All 12 Floor 4 rooms (402-415) pre-allocated in PMS; keys cut and pre-packaged in RFID pouches.',
    },
    perspectives: [
      {
        dept: 'front_desk',
        obs: '50-guest coach arrival in 30 minutes. Main lobby front desk capped at 4 simultaneous check-ins.',
        rec: 'Open North Ballroom satellite reception counter with 3 roving tablet agents.',
      },
      {
        dept: 'housekeeping',
        obs: '12 Floor 4 rooms cleaned; awaiting final supervisor white-glove inspection.',
        rec: 'Assign supervisor Elena Gomez to blitz-inspect rooms 402-415 before 13:30.',
      },
      {
        dept: 'maintenance',
        obs: 'Elevator bank B undergoing routine sensor check; Floor 4 service elevator active.',
        rec: 'Clear Elevator Bank B for dedicated group luggage porterage during coach unload.',
      },
      {
        dept: 'revenue',
        obs: 'Master billing folio requires deposit verification prior to key release.',
        rec: 'Validate corporate master credit authorization; lock incidental folios to individual guests.',
      },
    ],
    agreements: [
      'Main lobby front desk kept 100% open for non-group guest check-ins and VIP arrivals.',
      'All 50 pieces of group luggage pre-tagged and routed via Elevator B to avoid guest lobby interference.',
      'North Ballroom satellite desk operational with key packets by 13:15.',
    ],
    conflict: {
      title: 'Front Desk Staffing Split vs Lobby Queue Capacity',
      revenue: 'Requests all front desk staff remain in lobby for potential high-yield walk-ins.',
      frontDesk: 'Requires 2 agents deployed to North Ballroom satellite station for group check-in.',
      resolution: 'Manager Resolution: Deploys 2 agents to Ballroom while Front Desk Supervisor monitors main lobby.',
    },
    impact: {
      guest: { title: 'Seamless Flow', desc: 'Bypasses lobby congestion; 0 wait time for arrivals.' },
      ops: { title: 'Satellite Active', desc: 'North Ballroom counter handles batch check-in.' },
      revenue: { title: 'Master Cleared', desc: '₹3,50,000 group folio pre-authorized.' },
      resource: { title: '4 Staff Active', desc: '2 satellite agents + 1 supervisor + 1 luggage lead.' },
      risk: { title: 'Low Risk', desc: 'Contingency rooms available if room swap needed.' },
    },
    defaultPlan: {
      id: 'plan-group-arrival',
      status: 'pending_review',
      summary: 'Activate North Ballroom batch check-in satellite desk for 50-guest wedding party, inspect Floor 4 rooms, pre-stage luggage, and verify master folio settlement.',
      items: [
        {
          id: 'item-grp-1',
          description: 'Establish North Ballroom satellite reception desk for 50-guest batch check-in',
          department: 'front_desk',
          assigned_staff: 'Sarah Jenkins',
          room_id: 'ballroom-north',
          priority: 'critical',
          status: 'pending_review',
          estimated_duration_minutes: 15,
        },
        {
          id: 'item-grp-2',
          description: 'Execute final rapid quality inspection across 12 Floor 4 group rooms (402-415)',
          department: 'housekeeping',
          assigned_staff: 'Elena Gomez',
          room_id: 'floor-4',
          priority: 'high',
          status: 'pending_review',
          estimated_duration_minutes: 20,
        },
        {
          id: 'item-grp-3',
          description: 'Pre-tag and stage 50 pieces of group luggage in staging salon for batch porterage',
          department: 'front_desk',
          assigned_staff: 'David Chen',
          room_id: 'staging-salon',
          priority: 'high',
          status: 'pending_review',
          estimated_duration_minutes: 25,
        },
        {
          id: 'item-grp-4',
          description: 'Verify master account billing credit authorization and lock room keys in batch',
          department: 'revenue',
          assigned_staff: 'Chloe Bennett',
          room_id: 'front-desk-1',
          priority: 'medium',
          status: 'pending_review',
          estimated_duration_minutes: 10,
        },
      ],
    },
  },
];

const AGENT_META = {
  front_desk:   { label: 'Front Desk',   dept: 'Guest Operations',     icon: Users,      color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  housekeeping: { label: 'Housekeeping', dept: 'Turnover & Readiness', icon: BedDouble,  color: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200' },
  maintenance:  { label: 'Maintenance',  dept: 'Engineering & HVAC',   icon: Wrench,     color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200' },
  revenue:      { label: 'Revenue',      dept: 'Inventory & Yield',    icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
};

function OperationalDecisionReviewContent() {
  const { role, roleData } = useRole();
  const searchParams = useSearchParams();
  const scenarioParam = searchParams.get('scenario');
  const planIdParam = searchParams.get('planId');
  const actionParam = searchParams.get('action');
  const incidentIdParam = searchParams.get('incidentId');

  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Core plan data initialized with default so it is NEVER null
  const [plan, setPlan] = useState(SCENARIOS[0].defaultPlan);
  const [auditTrail, setAuditTrail] = useState([
    {
      id: 'audit-init-0',
      action_plan_id: SCENARIOS[0].planId,
      actor_id: 'system_ai_orchestrator',
      actor_role: 'system',
      decision: 'create',
      reason: 'AI Consensus Engine generated initial operational action plan.',
      previous_status: 'none',
      new_status: 'pending_review',
      created_at: new Date().toISOString(),
    }
  ]);

  // Dialog & Modal States
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);

  // Single-Task Human-in-the-Loop Governance States
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [taskEditForm, setTaskEditForm] = useState({
    description: '',
    assigned_staff: '',
    room_id: '',
    priority: 'medium',
    estimated_duration_minutes: 15,
    reason: '',
  });

  // Form Inputs
  const [approveComment, setApproveComment] = useState('Approved for execution. Proceed with room turnover and VIP escort.');
  const [rejectReason, setRejectReason] = useState('');
  const [modifyReason, setModifyReason] = useState('Reassigning to alternative inspected room.');
  const [editableActions, setEditableActions] = useState(SCENARIOS[0].defaultPlan.items);
  const [activeTab, setActiveTab] = useState('decision'); // 'decision' | 'audit'
  const [helpOpen, setHelpOpen] = useState(false);

  // Nugen Domain-Aligned AI State
  const [nugenIntelligence, setNugenIntelligence] = useState(null);
  const [nugenStatus, setNugenStatus] = useState(null);
  const [nugenLoading, setNugenLoading] = useState(false);

  const showNotification = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const fetchNugenAnalysis = useCallback(async (scenario = selectedScenario) => {
    try {
      setNugenLoading(true);
      const [analysisRes, statusRes] = await Promise.allSettled([
        analyzeWithNugen({ trigger: { type: scenario.id || 'vip_arrival', incident_id: scenario.eventId } }),
        getNugenStatus(),
      ]);

      if (analysisRes.status === 'fulfilled' && analysisRes.value?.data?.domain_analysis) {
        setNugenIntelligence(analysisRes.value.data.domain_analysis);
      }
      if (statusRes.status === 'fulfilled' && statusRes.value?.data) {
        setNugenStatus(statusRes.value.data);
      }
    } catch (err) {
      console.warn('Nugen fetch error:', err.message);
    } finally {
      setNugenLoading(false);
    }
  }, [selectedScenario]);

  // Fetch plan from backend with fallback
  const loadPlan = useCallback(async (planId = selectedScenario.planId) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await getActionPlan(planId);
      if (res?.data) {
        setPlan(res.data);
        setEditableActions(JSON.parse(JSON.stringify(res.data.items || [])));
        const auditRes = await getActionPlanAuditTrail(planId);
        if (auditRes?.data?.audit_trail?.length > 0) {
          setAuditTrail(auditRes.data.audit_trail);
        }
      }
    } catch (err) {
      console.warn('Failed to load plan from backend, relying on scenario defaults:', err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedScenario.planId]);

  useEffect(() => {
    loadPlan(selectedScenario.planId);
    fetchNugenAnalysis(selectedScenario);
  }, [selectedScenario, loadPlan, fetchNugenAnalysis]);

  // Handle incoming query params from Swarm page, Incidents log, or Telegram alert
  useEffect(() => {
    if (!scenarioParam && !planIdParam && !incidentIdParam) return;

    let matched = null;
    if (scenarioParam) {
      const lower = scenarioParam.toLowerCase();
      matched = SCENARIOS.find((s) => 
        s.id.toLowerCase() === lower ||
        s.planId.toLowerCase() === lower ||
        (lower.includes('vip') && s.id === 'vip_arrival') ||
        (lower.includes('group') && s.id === 'group_arrival') ||
        (lower.includes('incident') && s.id === 'multiple_incidents') ||
        (lower.includes('scen-001') && s.id === 'vip_arrival') ||
        (lower.includes('scen-002') && s.id === 'vip_arrival') ||
        (lower.includes('scen-003') && s.id === 'multiple_incidents') ||
        (lower.includes('scen-004') && s.id === 'group_arrival') ||
        (lower.includes('scen-006') && s.id === 'multiple_incidents')
      );
    }

    if (!matched && planIdParam) {
      matched = SCENARIOS.find((s) => s.planId === planIdParam || s.id === planIdParam);
    }

    if (!matched) {
      matched = SCENARIOS[0];
    }

    if (matched && matched.id !== selectedScenario.id) {
      setSelectedScenario(matched);
      setPlan(matched.defaultPlan);
      setEditableActions(JSON.parse(JSON.stringify(matched.defaultPlan.items)));
      loadPlan(matched.planId);
      fetchNugenAnalysis(matched);
      showNotification(`Opened Case for Human Approval: ${matched.label}`);
    }

    if (actionParam === 'approve') {
      setShowApproveModal(true);
    } else if (actionParam === 'review') {
      setTimeout(() => {
        const el = document.getElementById('decision-controls');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 350);
    }
  }, [scenarioParam, planIdParam, actionParam, incidentIdParam, loadPlan, fetchNugenAnalysis, selectedScenario.id]);

  // Scenario Switcher Handler
  const handleSelectScenario = (scen) => {
    setSelectedScenario(scen);
    setPlan(scen.defaultPlan);
    setEditableActions(JSON.parse(JSON.stringify(scen.defaultPlan.items)));
    setAuditTrail([
      {
        id: `audit-${scen.id}-${Date.now()}`,
        action_plan_id: scen.planId,
        actor_id: 'system_ai_orchestrator',
        actor_role: 'system',
        decision: 'create',
        reason: `AI Consensus Engine generated plan for ${scen.label}.`,
        previous_status: 'none',
        new_status: 'pending_review',
        created_at: new Date().toISOString(),
      }
    ]);
    showNotification(`Switched to: ${scen.label}`);
    loadPlan(scen.planId);
    fetchNugenAnalysis(scen);
  };

  // Run Swarm Deliberation
  const handleRunDeliberation = async () => {
    setNugenLoading(true);
    showNotification('Swarm Deliberation in progress across 4 departments...');
    try {
      await fetchNugenAnalysis(selectedScenario);
      showNotification(`Swarm consensus reached for ${selectedScenario.label}`);
    } finally {
      setNugenLoading(false);
    }
  };

  // Handle Approve
  const handleApprove = async () => {
    const actorId = roleData?.email || 'admin@resort360.demo';
    const actorRole = role || 'admin';
    const now = new Date().toISOString();

    // 1. Optimistic Local Update
    setPlan((prev) => ({
      ...prev,
      status: 'approved',
      approved_by: actorId,
      approved_at: now,
      items: (prev.items || []).map((it) => ({
        ...it,
        status: it.status === 'pending_review' ? 'approved' : it.status,
      })),
    }));

    setAuditTrail((prev) => [
      {
        id: `audit-${Date.now()}`,
        action_plan_id: plan.id,
        actor_id: actorId,
        actor_role: actorRole,
        decision: 'approve',
        reason: approveComment,
        previous_status: plan.status,
        new_status: 'approved',
        created_at: now,
      },
      ...prev,
    ]);

    setShowApproveModal(false);
    showNotification('Action Plan Approved! Operational work orders dispatched.');

    // 2. Call backend in background
    try {
      setLoading(true);
      await approveActionPlan(plan.id, {
        comment: approveComment,
        actorId,
        actorRole,
      });
      await loadPlan(plan.id);
    } catch (err) {
      console.warn('Backend approval sync warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    const actorId = roleData?.email || 'admin@resort360.demo';
    const actorRole = role || 'admin';
    const now = new Date().toISOString();

    // 1. Optimistic Local Update
    setPlan((prev) => ({
      ...prev,
      status: 'rejected',
      rejected_reason: rejectReason,
      rejected_by: actorId,
      rejected_at: now,
    }));

    setAuditTrail((prev) => [
      {
        id: `audit-${Date.now()}`,
        action_plan_id: plan.id,
        actor_id: actorId,
        actor_role: actorRole,
        decision: 'reject',
        reason: rejectReason,
        previous_status: plan.status,
        new_status: 'rejected',
        created_at: now,
      },
      ...prev,
    ]);

    setShowRejectModal(false);
    showNotification('Action Plan Rejected. Rejection logged in audit trail.');

    // 2. Call backend in background
    try {
      setLoading(true);
      await rejectActionPlan(plan.id, {
        reason: rejectReason,
        actorId,
        actorRole,
      });
      await loadPlan(plan.id);
    } catch (err) {
      console.warn('Backend rejection sync warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Modify
  const handleModify = async () => {
    if (!modifyReason.trim()) return;
    const actorId = roleData?.email || 'admin@resort360.demo';
    const actorRole = role || 'admin';
    const now = new Date().toISOString();

    // 1. Optimistic Local Update
    setPlan((prev) => ({
      ...prev,
      status: 'modified_pending_approval',
      modification_reason: modifyReason,
      items: JSON.parse(JSON.stringify(editableActions)),
    }));

    setAuditTrail((prev) => [
      {
        id: `audit-${Date.now()}`,
        action_plan_id: plan.id,
        actor_id: actorId,
        actor_role: actorRole,
        decision: 'modify',
        reason: modifyReason,
        previous_status: plan.status,
        new_status: 'modified_pending_approval',
        created_at: now,
      },
      ...prev,
    ]);

    setShowModifyModal(false);
    showNotification('Action Plan Modified! Now awaiting approval.');

    // 2. Call backend in background
    try {
      setLoading(true);
      await modifyActionPlan(plan.id, {
        reason: modifyReason,
        modifications: editableActions,
        actorId,
        actorRole,
      });
      await loadPlan(plan.id);
    } catch (err) {
      console.warn('Backend modification sync warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset / Re-open Plan
  const handleReset = async () => {
    const actorId = roleData?.email || 'admin@resort360.demo';
    const actorRole = role || 'admin';
    const now = new Date().toISOString();

    // 1. Optimistic Local Update
    setPlan((prev) => ({
      ...prev,
      status: 'pending_review',
      approved_by: null,
      approved_at: null,
      rejected_reason: null,
      items: (prev.items || []).map((it) => ({
        ...it,
        status: 'pending_review',
      })),
    }));

    setAuditTrail((prev) => [
      {
        id: `audit-${Date.now()}`,
        action_plan_id: plan.id,
        actor_id: actorId,
        actor_role: actorRole,
        decision: 'reset',
        reason: 'Plan reset back to reviewable state for operational re-evaluation.',
        previous_status: plan.status,
        new_status: 'pending_review',
        created_at: now,
      },
      ...prev,
    ]);

    showNotification('Action Plan reset to pending review!');

    // 2. Call backend in background
    try {
      setLoading(true);
      await resetActionPlan(plan.id);
      await loadPlan(plan.id);
    } catch (err) {
      console.warn('Backend reset sync warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle individual item status progression with optimistic local update
  const handleItemStatusToggle = async (itemId, currentStatus) => {
    const nextStatus = currentStatus === 'approved' || currentStatus === 'pending_review'
      ? 'in_progress'
      : currentStatus === 'in_progress'
      ? 'completed'
      : 'approved';

    // 1. Optimistic Local State Update
    setPlan((prev) => {
      if (!prev) return prev;
      const updatedItems = (prev.items || []).map((it) => (it.id === itemId ? { ...it, status: nextStatus } : it));
      const allCompleted = updatedItems.length > 0 && updatedItems.every((it) => it.status === 'completed');
      return {
        ...prev,
        status: allCompleted ? 'completed' : prev.status === 'completed' ? 'in_progress' : prev.status,
        items: updatedItems,
      };
    });

    showNotification(`Task status updated to: ${nextStatus.toUpperCase()}`);

    // 2. Backend sync in background
    try {
      await updateActionItemStatus(plan.id, itemId, nextStatus);
    } catch (err) {
      console.warn('Backend item status sync warning:', err.message);
    }
  };

  // Human-in-the-Loop: Open Task Detailed Overview
  const handleOpenTaskDetail = (task) => {
    setSelectedTaskForDetail(task);
  };

  // Human-in-the-Loop: Open Task Modification Modal for ONLY this task
  const handleOpenTaskEdit = (task) => {
    setSelectedTaskForEdit(task);
    setTaskEditForm({
      description: task.description || '',
      assigned_staff: task.assigned_staff || '',
      room_id: task.room_id || '',
      priority: task.priority || 'medium',
      estimated_duration_minutes: task.estimated_duration_minutes || 15,
      reason: '',
    });
  };

  // Human-in-the-Loop: Approve only this specific task
  const handleApproveIndividualTask = async (taskId) => {
    const actorId = roleData?.email || 'admin@resort360.demo';
    const now = new Date().toISOString();

    setPlan((prev) => {
      if (!prev) return prev;
      const updated = (prev.items || []).map((it) =>
        it.id === taskId ? { ...it, status: 'approved', approved_by: actorId, approved_at: now } : it
      );
      const allApproved = updated.every(
        (it) => it.status === 'approved' || it.status === 'completed' || it.status === 'in_progress'
      );
      return {
        ...prev,
        status: allApproved ? 'approved' : prev.status,
        items: updated,
      };
    });

    setAuditTrail((prev) => [
      {
        id: `audit-task-${Date.now()}`,
        action_plan_id: plan.id,
        actor_id: actorId,
        actor_role: role || 'admin',
        decision: 'approve_task',
        reason: `Duty Manager approved task ${taskId} individually.`,
        new_status: 'approved',
        created_at: now,
      },
      ...prev,
    ]);

    if (selectedTaskForDetail?.id === taskId) {
      setSelectedTaskForDetail((prev) => (prev ? { ...prev, status: 'approved' } : null));
    }

    showNotification('Task approved individually! Work order ready for dispatch.');

    try {
      await updateActionItemStatus(plan.id, taskId, 'approved');
    } catch (err) {
      console.warn('Backend item approval sync warning:', err.message);
    }
  };

  // Human-in-the-Loop: Reject only this specific task
  const handleRejectIndividualTask = async (taskId, reason = 'Rejected by Duty Manager') => {
    const actorId = roleData?.email || 'admin@resort360.demo';
    const now = new Date().toISOString();

    setPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: (prev.items || []).map((it) =>
          it.id === taskId ? { ...it, status: 'rejected', rejected_reason: reason } : it
        ),
      };
    });

    setAuditTrail((prev) => [
      {
        id: `audit-task-${Date.now()}`,
        action_plan_id: plan.id,
        actor_id: actorId,
        actor_role: role || 'admin',
        decision: 'reject_task',
        reason: reason || 'Task rejected by manager',
        new_status: 'rejected',
        created_at: now,
      },
      ...prev,
    ]);

    if (selectedTaskForDetail?.id === taskId) {
      setSelectedTaskForDetail((prev) => (prev ? { ...prev, status: 'rejected' } : null));
    }

    showNotification('Task rejected by Duty Manager.');

    try {
      await updateActionItemStatus(plan.id, taskId, 'rejected');
    } catch (err) {
      console.warn('Backend item reject sync warning:', err.message);
    }
  };

  // Human-in-the-Loop: Save edits for ONLY this specific task
  const handleSaveTaskEdit = async () => {
    if (!selectedTaskForEdit) return;
    const actorId = roleData?.email || 'admin@resort360.demo';
    const now = new Date().toISOString();

    setPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: (prev.items || []).map((it) =>
          it.id === selectedTaskForEdit.id
            ? {
                ...it,
                description: taskEditForm.description,
                assigned_staff: taskEditForm.assigned_staff,
                room_id: taskEditForm.room_id,
                priority: taskEditForm.priority,
                estimated_duration_minutes: Number(taskEditForm.estimated_duration_minutes) || 15,
                status: 'modified_pending_approval',
                modification_reason: taskEditForm.reason || 'Manager adjusted parameters for this task',
              }
            : it
        ),
      };
    });

    setAuditTrail((prev) => [
      {
        id: `audit-task-mod-${Date.now()}`,
        action_plan_id: plan.id,
        actor_id: actorId,
        actor_role: role || 'admin',
        decision: 'modify_task',
        reason: taskEditForm.reason || `Modified task ${selectedTaskForEdit.id} parameters`,
        new_status: 'modified_pending_approval',
        created_at: now,
      },
      ...prev,
    ]);

    showNotification(`Task updated! Ready for human approval.`);
    setSelectedTaskForEdit(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return { label: 'APPROVED', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'modified_pending_approval':
        return { label: 'MODIFIED — AWAITING APPROVAL', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'rejected':
        return { label: 'REJECTED', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'in_progress':
        return { label: 'IN PROGRESS', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'completed':
        return { label: 'COMPLETED', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'pending_review':
      case 'pending_approval':
      default:
        return { label: 'AWAITING MANAGER REVIEW', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
  };

  const statusBadge = getStatusBadge(plan?.status);
  const items = plan?.items || selectedScenario.defaultPlan.items || [];
  const completedCount = items.filter((i) => i.status === 'completed').length;
  const progressPct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <DashboardShell>
      {/* Toast Notification Banner */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 p-3.5 rounded-xl border border-[#714B67]/30 bg-[#714B67]/10 text-[#714B67] shadow-lg flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#714B67] shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Operational Decision Review
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusBadge.bg}`}>
              {statusBadge.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Human-in-the-Loop decision governance: AI multi-agent recommendations require explicit manager review and approval.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <HelpDocsModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} currentPath="/dashboard/consensus" />

          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#714B67]/30 bg-[#714B67]/10 hover:bg-[#714B67] hover:text-white text-[#714B67] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Consensus Governance Documentation & Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#714B67]" />
            <span>Help &amp; Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('decision')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'decision'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'border border-border bg-surface text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Decision Console
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'border border-border bg-surface text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Audit Trail ({auditTrail.length})
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg border border-rose-300 bg-rose-50 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* HUMAN-IN-THE-LOOP APPROVAL QUICK BAR */}
      <div className="rounded-2xl border-2 border-[#714B67]/40 bg-gradient-to-r from-[#714B67]/15 via-purple-500/5 to-slate-50 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#714B67] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-foreground">
                Human-in-the-Loop Governance: Decision Pending
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#714B67]/15 text-[#714B67] border border-[#714B67]/30">
                ACTIVE CASE: {selectedScenario.label}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {selectedScenario.eventId}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Swarm consensus deliberation completed across 4 departments. Review arbitration and authorize operational tasks for immediate dispatch.
            </p>
          </div>
        </div>

        {plan?.status !== 'approved' && plan?.status !== 'rejected' ? (
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setShowApproveModal(true)}
              className="px-4 py-2 rounded-lg bg-[#714B67] hover:bg-[#5D3D55] active:scale-98 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Approve Plan</span>
            </button>
            <button
              type="button"
              onClick={() => setShowModifyModal(true)}
              className="px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-foreground text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-primary" />
              <span>Modify</span>
            </button>
            <button
              type="button"
              onClick={() => setShowRejectModal(true)}
              className="px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${plan?.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'}`}>
              {plan?.status === 'approved' ? '✅ Plan Authorized' : '❌ Plan Rejected'}
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Review</span>
            </button>
          </div>
        )}
      </div>

      {/* OPERATIONAL SCENARIOS SWITCHER */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#714B67]" />
            <h3 className="text-xs sm:text-sm font-bold text-foreground">
              Select Operational Problem / Incident Scenario
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {SCENARIOS.length} Benchmark Scenarios
            </span>
          </div>
          <button
            type="button"
            onClick={handleRunDeliberation}
            disabled={nugenLoading}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#714B67] hover:bg-[#5D3D55] active:scale-98 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{nugenLoading ? 'Deliberating Swarm...' : 'Run Swarm Deliberation'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {SCENARIOS.map((scen) => {
            const isSelected = selectedScenario.id === scen.id;
            return (
              <button
                key={scen.id}
                type="button"
                onClick={() => handleSelectScenario(scen)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'border-[#714B67] bg-[#714B67]/5 shadow-sm ring-2 ring-[#714B67]/20'
                    : 'border-border bg-surface hover:bg-surface-secondary/70 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                    isSelected ? 'bg-[#714B67] text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {scen.tag}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-slate-500">
                    {scen.eventId}
                  </span>
                </div>
                <div className={`text-xs font-bold ${isSelected ? 'text-[#714B67] font-extrabold' : 'text-foreground'}`}>
                  {scen.label}
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {scen.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* TOP SECTION: INCIDENT / SITUATION CONTEXT */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${selectedScenario.priorityBg || 'bg-rose-100 text-rose-800 border-rose-200'}`}>
                {selectedScenario.priority || 'CRITICAL'} OPERATIONAL EVENT
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">{selectedScenario.eventId}</span>
              <span className="text-[11px] font-mono text-muted-foreground">Reported: {selectedScenario.time}</span>
            </div>
            <h2 className="text-base font-bold text-foreground">
              {selectedScenario.label}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedScenario.desc}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center shrink-0">
            <div className="p-2 rounded-lg bg-surface-secondary/70 border border-border">
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Priority</div>
              <div className={`text-xs font-bold mt-0.5 ${selectedScenario.priorityColor || 'text-rose-600'}`}>{selectedScenario.priority}</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-secondary/70 border border-border">
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Affected Rooms</div>
              <div className="text-xs font-bold text-foreground mt-0.5">{selectedScenario.rooms}</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-secondary/70 border border-border">
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Affected Guest</div>
              <div className="text-xs font-bold text-foreground mt-0.5">{selectedScenario.guest}</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-secondary/70 border border-border">
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Departments</div>
              <div className="text-xs font-bold text-[#714B67] mt-0.5">4 Active</div>
            </div>
          </div>
        </div>

        {/* Status Lifecycle Timeline */}
        <div className="pt-4 flex items-center justify-between overflow-x-auto text-xs">
          {[
            { label: 'AI Generated', desc: 'Swarm Consensus', active: true, done: true },
            { label: 'Manager Review', desc: 'Active Decision', active: plan?.status !== 'pending_review', done: ['approved', 'rejected', 'modified_pending_approval', 'in_progress', 'completed'].includes(plan?.status) },
            { label: 'Modified', desc: plan?.modified_plan || plan?.status === 'modified_pending_approval' ? 'Manager Edits' : 'None', active: plan?.status === 'modified_pending_approval', done: !!plan?.modified_plan || plan?.status === 'modified_pending_approval' },
            { label: 'Approved', desc: plan?.approved_by ? `${plan.approved_by.split('@')[0]}` : 'Required', active: plan?.status === 'approved', done: ['approved', 'in_progress', 'completed'].includes(plan?.status) },
            { label: 'In Progress', desc: `${completedCount}/${items.length} Tasks`, active: plan?.status === 'in_progress', done: plan?.status === 'completed' },
            { label: 'Completed', desc: 'All Actions Cleared', active: plan?.status === 'completed', done: plan?.status === 'completed' },
          ].map((step, idx, arr) => (
            <div key={idx} className="flex items-center gap-2 shrink-0 pr-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                step.done
                  ? 'bg-emerald-600 text-white'
                  : step.active
                  ? 'bg-primary text-primary-foreground animate-pulse'
                  : 'bg-surface-secondary text-muted-foreground border border-border'
              }`}>
                {step.done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <div>
                <div className={`font-semibold ${step.done || step.active ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{step.desc}</div>
              </div>
              {idx < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 ml-2" />}
            </div>
          ))}
        </div>
      </section>

      {activeTab === 'audit' ? (
        /* AUDIT TRAIL TAB */
        <section className="rounded-xl border border-border bg-surface p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Immutable Decision Audit Trail
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every AI generation, manager review, modification, and execution state change is recorded with actor timestamping.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-secondary border border-border text-muted-foreground">
              {auditTrail.length} Logged Events
            </span>
          </div>

          <div className="space-y-3">
            {auditTrail.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">No audit records logged yet.</div>
            ) : (
              auditTrail.map((log, i) => (
                <div key={log.id || i} className="p-3.5 rounded-lg border border-border bg-surface-secondary/30 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        log.decision === 'approve'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : log.decision === 'reject'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : log.decision === 'modify'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : log.decision === 'reset'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {log.decision}
                      </span>
                      <span className="font-semibold text-foreground">{log.actor_id} ({log.actor_role})</span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {log.previous_status} → {log.new_status}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{log.reason}</p>

                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <div className="mt-2 p-2 rounded bg-surface border border-border/80 font-mono text-[11px] text-muted-foreground">
                        <span className="font-bold text-foreground">Logged Changes: </span>
                        {JSON.stringify(log.changes)}
                      </div>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground shrink-0">
                    {log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now'}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      ) : (
        /* DECISION CONSOLE TAB */
        <div className="space-y-6">
          {/* NUGEN DOMAIN-ALIGNED INTELLIGENCE */}
          <section className="rounded-xl border border-primary/40 bg-primary/[0.03] p-5 shadow-soft space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-border/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/30">
                      Nugen Domain-Aligned Model
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      {nugenIntelligence?.confidence_score || 96.2}% Confidence
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                    Resort 360 Hospitality Intelligence
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs font-mono self-start sm:self-auto">
                <span className="text-muted-foreground text-[11px]">
                  Model: <strong className="text-foreground">{nugenIntelligence?.aligned_model_id || 'resort360-hospitality-v1'}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => fetchNugenAnalysis()}
                  disabled={nugenLoading}
                  className="px-2.5 py-1 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${nugenLoading ? 'animate-spin text-primary' : ''}`} />
                  Re-analyze
                </button>
              </div>
            </div>

            {/* Structured Domain Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-surface border border-border/80">
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">Incident</span>
                <strong className="text-foreground text-xs mt-0.5 block truncate">
                  {selectedScenario.label}
                </strong>
              </div>
              <div className="p-3 rounded-lg bg-surface border border-border/80">
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">Severity</span>
                <span className={`inline-block mt-0.5 text-xs font-bold uppercase ${selectedScenario.priorityColor || 'text-rose-600'}`}>
                  {selectedScenario.priority || 'CRITICAL'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface border border-border/80 sm:col-span-2">
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">Affected Teams</span>
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {(nugenIntelligence?.affected_departments || ['front_desk', 'maintenance', 'housekeeping', 'revenue']).map((dept) => (
                    <span key={dept} className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-surface-secondary border border-border font-semibold text-foreground">
                      {dept.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Recommendation, Why, Impact */}
            <div className="space-y-2.5 text-xs leading-relaxed">
              <div className="p-3.5 rounded-lg bg-surface border border-border/80">
                <div className="font-bold text-foreground text-xs flex items-center gap-1.5 text-primary mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  AI Domain Recommendation
                </div>
                <p className="text-foreground/90">
                  {nugenIntelligence?.summary || selectedScenario.aiSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-lg bg-surface border border-border/80">
                  <div className="font-bold text-foreground text-xs text-amber-700 mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    Why (Operational Justification)
                  </div>
                  <p className="text-muted-foreground">
                    {nugenIntelligence?.explanation?.why || selectedScenario.justification.rootCause}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-surface border border-border/80">
                  <div className="font-bold text-foreground text-xs text-rose-700 mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    Impact & Risk Mitigation
                  </div>
                  <p className="text-muted-foreground">
                    {nugenIntelligence?.explanation?.impact || selectedScenario.impact.guest.desc}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 1: WHAT IS THE AI RECOMMENDING? */}
          <section className="rounded-xl border border-border bg-surface p-5 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                1. What is the AI Recommending?
              </h2>
              <span className="text-[10px] font-mono text-muted-foreground">AI Consensus Synthesis</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed">
              {plan?.summary || selectedScenario.aiSummary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="p-2.5 rounded-lg border border-border/80 bg-surface-secondary/40 flex items-start gap-2.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-foreground">{item.description}</div>
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5 capitalize">
                      {item.department?.replace('_', ' ')} · {item.assigned_staff || 'Available Staff'} · {item.estimated_duration_minutes || 20}m est.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 2: WHY? (Plain Operational Reasoning) */}
          <section className="rounded-xl border border-border bg-surface p-5 shadow-soft space-y-2">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              2. Why? Operational Justification
            </h2>
            <div className="p-3.5 rounded-lg bg-surface-secondary/50 border border-border/80 text-xs text-foreground leading-relaxed space-y-1.5">
              <p>
                <strong>Root Cause:</strong> {selectedScenario.justification.rootCause}
              </p>
              <p>
                <strong>Guest &amp; Service Priority:</strong> {selectedScenario.justification.priorityImpact}
              </p>
              <p>
                <strong>Inventory &amp; Operational Match:</strong> {selectedScenario.justification.inventoryMatch}
              </p>
            </div>
          </section>

          {/* SECTION 3: DEPARTMENT PERSPECTIVES */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              3. Departmental Perspectives (Summarized)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedScenario.perspectives.map((d) => {
                const meta = AGENT_META[d.dept] || { label: d.dept, dept: 'Operations', icon: Bot, color: 'text-primary', bg: 'bg-primary/10' };
                const Icon = meta.icon;
                return (
                  <div key={d.dept} className="rounded-xl border border-border bg-surface p-4 shadow-soft space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border ${meta.bg}`}>
                        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground leading-tight">{meta.label}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{meta.dept}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      <strong className="text-foreground font-semibold">Observation: </strong>{d.obs}
                    </div>
                    <div className="text-[11px] text-foreground font-medium pt-1 border-t border-border/60">
                      <span className="text-primary font-bold">Proposal: </span>{d.rec}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 4 & 5: AGREEMENTS & CONFLICTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Agreements */}
            <div className="rounded-xl border border-border bg-surface p-4 shadow-soft space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  4. Departmental Agreements
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-foreground">
                {selectedScenario.agreements.map((agr, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{agr}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Conflicts */}
            <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                    5. Detected Operational Conflict
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-200 text-amber-900 border border-amber-300">
                  DECISION REQUIRED
                </span>
              </div>
              <div className="text-xs text-amber-950 space-y-1.5 leading-relaxed">
                <p>
                  <strong>Revenue Management:</strong> {selectedScenario.conflict.revenue}
                </p>
                <p>
                  <strong>Front Desk Operations:</strong> {selectedScenario.conflict.frontDesk}
                </p>
                <p className="text-[11px] text-amber-900 font-semibold pt-1 border-t border-amber-200">
                  {selectedScenario.conflict.resolution}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 6: IMPACT ANALYSIS */}
          <section className="rounded-xl border border-border bg-surface p-5 shadow-soft space-y-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              6. Impact Analysis &amp; Risk Assessment
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-surface-secondary/40">
                <div className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Guest Impact</div>
                <div className="text-xs font-bold text-emerald-700 mt-1">{selectedScenario.impact.guest.title}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{selectedScenario.impact.guest.desc}</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface-secondary/40">
                <div className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Operational Impact</div>
                <div className="text-xs font-bold text-foreground mt-1">{selectedScenario.impact.ops.title}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{selectedScenario.impact.ops.desc}</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface-secondary/40">
                <div className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Revenue Impact</div>
                <div className="text-xs font-bold text-foreground mt-1">{selectedScenario.impact.revenue.title}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{selectedScenario.impact.revenue.desc}</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface-secondary/40">
                <div className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Resource Impact</div>
                <div className="text-xs font-bold text-foreground mt-1">{selectedScenario.impact.resource.title}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{selectedScenario.impact.resource.desc}</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface-secondary/40">
                <div className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Operational Risk</div>
                <div className="text-xs font-bold text-emerald-700 mt-1">{selectedScenario.impact.risk.title}</div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{selectedScenario.impact.risk.desc}</p>
              </div>
            </div>
          </section>

          {/* SECTION 7: ACTION PLAN OPERATIONAL TABLE */}
          <section className="rounded-xl border border-border bg-surface shadow-soft overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  7. Action Plan Task Table
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Detailed operational steps dispatched to departments. Click status badge to advance execution.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-[11px] font-mono text-muted-foreground">Progress:</span>
                <div className="w-24 bg-surface-secondary rounded-full h-2 overflow-hidden border border-border">
                  <div className="bg-emerald-600 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="font-mono font-bold text-foreground text-[11px]">{completedCount}/{items.length} Done</span>
              </div>
            </div>

            <div className="p-3 bg-surface-secondary/40 border-b border-border text-[11px] text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#714B67] shrink-0" />
              <span>
                <strong>Human-in-the-Loop Governance:</strong> Duty Manager reviews and controls each task individually. Click <span className="font-semibold text-foreground">Overview</span> for AI reasoning, or <span className="font-semibold text-[#714B67]">Approve</span> / <span className="font-semibold text-amber-600">Modify</span> / <span className="font-semibold text-rose-600">Reject</span> that specific task.
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-secondary/50 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    <th className="py-2.5 px-3 font-semibold">Priority</th>
                    <th className="py-2.5 px-3 font-semibold">Proposed Action</th>
                    <th className="py-2.5 px-3 font-semibold">Department</th>
                    <th className="py-2.5 px-3 font-semibold">Assigned Staff</th>
                    <th className="py-2.5 px-3 font-semibold">Location</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Human-in-the-Loop Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {items.map((it, idx) => {
                    const isApproved = it.status === 'approved';
                    const isRejected = it.status === 'rejected';
                    const isModified = it.status === 'modified_pending_approval';
                    const isDone = it.status === 'completed';
                    const isInProgress = it.status === 'in_progress';

                    return (
                      <tr key={it.id || idx} className="hover:bg-surface-secondary/40 transition-colors">
                        <td className="py-3 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                            it.priority === 'critical'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : it.priority === 'high'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {it.priority}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                              Task #{idx + 1}
                            </span>
                            <span className="font-medium text-foreground">
                              {it.description}
                            </span>
                          </div>
                          {it.modification_reason && (
                            <div className="text-[10px] text-amber-700 italic mt-0.5">
                              Note: {it.modification_reason}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 capitalize text-muted-foreground font-medium">
                          {it.department?.replace('_', ' ')}
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-foreground">
                          {it.assigned_staff || 'Floor Attendant'}
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-foreground">
                          {it.room_id ? it.room_id.replace('room-', 'Room ') : '—'}
                        </td>

                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : isApproved
                              ? 'bg-[#714B67]/15 text-[#714B67] border border-[#714B67]/30'
                              : isModified
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : isRejected
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : isInProgress
                              ? 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse'
                              : 'bg-surface-secondary text-muted-foreground border-border'
                          }`}>
                            {isApproved && <Check className="w-2.5 h-2.5 text-[#714B67]" />}
                            {isDone && <Check className="w-2.5 h-2.5 text-emerald-700" />}
                            {it.status?.replace('_', ' ')?.toUpperCase() || 'PENDING'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Detailed Overview Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenTaskDetail(it)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border bg-surface hover:bg-surface-secondary text-foreground text-[10px] font-semibold transition-colors cursor-pointer"
                              title="Inspect AI observation and rationale for this specific task"
                            >
                              <Eye className="w-3 h-3 text-primary" />
                              <span>Overview</span>
                            </button>

                            {/* Approve Individual Task */}
                            {!isApproved && !isDone && (
                              <button
                                type="button"
                                onClick={() => handleApproveIndividualTask(it.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#714B67] hover:bg-[#5D3D55] text-white text-[10px] font-bold transition-colors cursor-pointer shadow-2xs"
                                title="Approve only this specific task"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                            )}

                            {/* Modify Individual Task */}
                            <button
                              type="button"
                              onClick={() => handleOpenTaskEdit(it)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Modify room, staff, or parameters for only this task"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Modify</span>
                            </button>

                            {/* Reject Individual Task */}
                            {!isRejected && (
                              <button
                                type="button"
                                onClick={() => handleRejectIndividualTask(it.id)}
                                className="inline-flex items-center gap-1 px-1.5 py-1 rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold transition-colors cursor-pointer"
                                title="Reject this specific task"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 8: APPROVAL CONTROLS */}
          <section id="decision-controls" className="rounded-xl border-2 border-[#714B67]/40 bg-surface p-5 shadow-soft scroll-mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  8. Human-in-the-Loop Decision Controls
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Logged in as <strong className="text-foreground">{roleData?.label || 'Resort Admin'}</strong> ({roleData?.email || 'admin@resort360.demo'}).
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {plan?.status === 'approved' ? (
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Plan Approved by {plan.approved_by || 'Admin'} at {plan.approved_at ? new Date(plan.approved_at).toLocaleTimeString() : '10:45 AM'}</span>
                    </div>
                    <Link
                      href={`/dashboard/execution/${plan.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#714B67] hover:bg-[#5D3D55] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>View Live Execution &amp; Dispatch →</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                      title="Reset plan to pending review for testing"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Review</span>
                    </button>
                  </div>
                ) : plan?.status === 'rejected' ? (
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 px-3.5 py-2 rounded-lg border border-rose-200">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Plan Rejected ({plan.rejected_reason || 'Manager Override'})</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                      title="Re-open review"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-open Review</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(true)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      Reject Plan
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowModifyModal(true)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-foreground text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-primary" />
                      Modify Plan
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowApproveModal(true)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#714B67] text-white hover:bg-[#5D3D55] active:scale-98 text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Approve Plan
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* APPROVE CONFIRMATION DIALOG */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <ShieldCheck className="w-5 h-5 text-[#714B67]" />
              <h3 className="text-base font-bold text-foreground">Approve Operational Action Plan?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              By approving, you confirm that the proposed operational actions can proceed immediately. Tasks will be formally dispatched to Housekeeping, Front Desk, and Engineering.
            </p>

            <div className="p-3 rounded-lg bg-surface-secondary/50 border border-border text-xs space-y-1">
              <div className="font-semibold text-foreground">Summary of Authorization:</div>
              {items.map((it, idx) => (
                <div key={idx} className="text-[11px] text-muted-foreground">
                  • {it.description} ({it.assigned_staff})
                </div>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                Approval Comment (Optional)
              </label>
              <input
                type="text"
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-surface text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-surface-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={loading}
                className="px-4 py-1.5 rounded-lg bg-[#714B67] text-white hover:bg-[#5D3D55] text-xs font-bold cursor-pointer"
              >
                {loading ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION DIALOG */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <XCircle className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-bold text-foreground">Reject Operational Action Plan</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Rejecting this AI proposal halts automated execution. A meaningful reason is required to maintain the decision audit log.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                Reason for Rejection <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Guest requested to wait in lobby for assigned room instead of moving."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-surface text-foreground focus:outline-hidden focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-surface-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODIFY PLAN DIALOG */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Modify Proposed Action Plan</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Human Override
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Edit operational parameters below. The original AI recommendation remains preserved in the audit trail.
            </p>

            {/* Editable Action Items */}
            <div className="space-y-3">
              {editableActions.map((act, idx) => (
                <div key={act.id || idx} className="p-3 rounded-lg border border-border bg-surface-secondary/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-primary uppercase">Task #{idx + 1} ({act.department})</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-muted-foreground uppercase">Action Description</label>
                    <input
                      type="text"
                      value={act.description}
                      onChange={(e) => {
                        const copy = [...editableActions];
                        copy[idx].description = e.target.value;
                        setEditableActions(copy);
                      }}
                      className="w-full text-xs p-1.5 rounded border border-border bg-surface text-foreground mt-0.5"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-muted-foreground uppercase">Room</label>
                      <input
                        type="text"
                        value={act.room_id || ''}
                        onChange={(e) => {
                          const copy = [...editableActions];
                          copy[idx].room_id = e.target.value;
                          setEditableActions(copy);
                        }}
                        className="w-full text-xs p-1.5 rounded border border-border bg-surface text-foreground mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-muted-foreground uppercase">Resource / Staff</label>
                      <input
                        type="text"
                        value={act.assigned_staff || ''}
                        onChange={(e) => {
                          const copy = [...editableActions];
                          copy[idx].assigned_staff = e.target.value;
                          setEditableActions(copy);
                        }}
                        className="w-full text-xs p-1.5 rounded border border-border bg-surface text-foreground mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-muted-foreground uppercase">Priority</label>
                      <select
                        value={act.priority}
                        onChange={(e) => {
                          const copy = [...editableActions];
                          copy[idx].priority = e.target.value;
                          setEditableActions(copy);
                        }}
                        className="w-full text-xs p-1.5 rounded border border-border bg-surface text-foreground mt-0.5"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                Reason for Modification <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Changed assigned attendant and verified room availability."
                value={modifyReason}
                onChange={(e) => setModifyReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-surface text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowModifyModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-surface-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModify}
                disabled={loading || !modifyReason.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#714B67] text-white hover:bg-[#5D3D55] text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Saving...' : 'Save Changes & Await Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASK DETAILED OVERVIEW MODAL (Human-in-the-Loop per-task inspection) */}
      {selectedTaskForDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4 text-xs">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    selectedTaskForDetail.priority === 'critical'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : selectedTaskForDetail.priority === 'high'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {selectedTaskForDetail.priority} PRIORITY
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-secondary text-muted-foreground uppercase border border-border">
                    ID: {selectedTaskForDetail.id}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  Task Overview: {selectedTaskForDetail.description}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskForDetail(null)}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface-secondary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Multi-Agent Rationale & Perspective */}
            <div className="p-3.5 rounded-lg bg-surface-secondary/60 border border-border space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <Bot className="w-4 h-4" />
                <span>Multi-Agent Swarm Operational Rationale</span>
              </div>
              {(() => {
                const persp = selectedScenario.perspectives?.find(
                  (p) => p.dept.toLowerCase() === (selectedTaskForDetail.department || '').toLowerCase()
                );
                return (
                  <div className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
                    <p>
                      <strong className="text-foreground">Agent Observation: </strong>
                      {persp?.obs || selectedScenario.justification?.rootCause || 'Detected operational constraint requiring action.'}
                    </p>
                    <p>
                      <strong className="text-foreground">Agent Recommendation: </strong>
                      {persp?.rec || selectedTaskForDetail.description}
                    </p>
                    <p className="pt-1 text-[11px] text-muted-foreground border-t border-border/60">
                      <strong>Target Department: </strong>
                      <span className="capitalize text-foreground font-semibold">
                        {selectedTaskForDetail.department?.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Task Operational Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg border border-border bg-surface">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Assigned Staff</div>
                <div className="font-bold text-foreground mt-0.5 text-xs">{selectedTaskForDetail.assigned_staff || 'Floor Lead'}</div>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-surface">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Location</div>
                <div className="font-bold text-foreground mt-0.5 text-xs font-mono">{selectedTaskForDetail.room_id ? selectedTaskForDetail.room_id.replace('room-', 'Room ') : 'Property Wide'}</div>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-surface">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Est. Duration</div>
                <div className="font-bold text-foreground mt-0.5 text-xs font-mono">{selectedTaskForDetail.estimated_duration_minutes || 20} mins</div>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-surface">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Task Status</div>
                <div className="font-bold text-xs mt-0.5 capitalize">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    selectedTaskForDetail.status === 'approved'
                      ? 'bg-[#714B67]/15 text-[#714B67]'
                      : selectedTaskForDetail.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedTaskForDetail.status?.replace('_', ' ') || 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Governance Actions for This Specific Task */}
            <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedTaskForDetail(null)}
                className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-surface-secondary cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const taskToEdit = selectedTaskForDetail;
                    setSelectedTaskForDetail(null);
                    handleOpenTaskEdit(taskToEdit);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Modify This Task</span>
                </button>

                {selectedTaskForDetail.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleRejectIndividualTask(selectedTaskForDetail.id)}
                    className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject Task</span>
                  </button>
                )}

                {selectedTaskForDetail.status !== 'approved' && selectedTaskForDetail.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => handleApproveIndividualTask(selectedTaskForDetail.id)}
                    className="px-4 py-1.5 rounded-lg bg-[#714B67] hover:bg-[#5D3D55] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve This Task</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE TASK MODIFICATION DIALOG (Modify ONLY this task, not 4 at once) */}
      {selectedTaskForEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Modify Specific Task ({selectedTaskForEdit.id})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskForEdit(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Modify operational parameters for <strong className="text-foreground">this individual task only</strong>. Original AI rationale is preserved in the audit log.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase font-semibold">Action Description</label>
                <input
                  type="text"
                  value={taskEditForm.description}
                  onChange={(e) => setTaskEditForm({ ...taskEditForm, description: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-foreground mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-muted-foreground uppercase font-semibold">Assigned Staff</label>
                  <input
                    type="text"
                    value={taskEditForm.assigned_staff}
                    onChange={(e) => setTaskEditForm({ ...taskEditForm, assigned_staff: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-foreground mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-muted-foreground uppercase font-semibold">Location / Room</label>
                  <input
                    type="text"
                    value={taskEditForm.room_id}
                    onChange={(e) => setTaskEditForm({ ...taskEditForm, room_id: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-foreground mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-muted-foreground uppercase font-semibold">Priority</label>
                  <select
                    value={taskEditForm.priority}
                    onChange={(e) => setTaskEditForm({ ...taskEditForm, priority: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-foreground mt-1"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-muted-foreground uppercase font-semibold">Est. Duration (Mins)</label>
                  <input
                    type="number"
                    value={taskEditForm.estimated_duration_minutes}
                    onChange={(e) => setTaskEditForm({ ...taskEditForm, estimated_duration_minutes: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-foreground mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-muted-foreground uppercase font-semibold">
                  Reason for Adjustment <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Reassigned to attendant on duty; modified timeline."
                  value={taskEditForm.reason}
                  onChange={(e) => setTaskEditForm({ ...taskEditForm, reason: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-border bg-surface text-foreground mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedTaskForEdit(null)}
                className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-surface-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTaskEdit}
                disabled={!taskEditForm.description.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#714B67] text-white hover:bg-[#5D3D55] text-xs font-bold disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                Save Single Task Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

export default function OperationalDecisionReviewPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell>
          <div className="py-20 text-center text-xs text-muted-foreground font-mono">
            Loading Operational Decision Review...
          </div>
        </DashboardShell>
      }
    >
      <OperationalDecisionReviewContent />
    </Suspense>
  );
}
