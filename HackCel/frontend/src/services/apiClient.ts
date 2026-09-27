import { API_URL, apiPost, apiGet } from '../lib/api';
import {
  CostIncidentSummary,
  FlashSaleOffer,
  GuestIntakeResult,
  HousekeepingReorder,
  MaintenanceCvResult,
} from '../types/schemas';

export interface ApiResponse<T> {
  result: T;
  latencyMs: number;
}

export async function sendTestPing(): Promise<{ status: string; event: string; payload: any }> {
  return apiPost<{ status: string; event: string; payload: any }>('/api/test/ping', {});
}

export async function callGuestIntake(params: {
  transcript: string;
  guest_id?: string | null;
  reservation_context?: any;
}): Promise<ApiResponse<GuestIntakeResult>> {
  const startTime = Date.now();
  const res = await apiPost<any>('/api/frontdesk/checkin', {
    name: params.guest_id || "Guest",
    reservation_id: "RES-" + Math.floor(Math.random() * 1000),
    room_id: 1,
    transcript: params.transcript,
  });
  return {
    result: {
      event_type: 'GUEST_INTAKE_RESULT',
      guest_id: params.guest_id || 'guest-001',
      persona_label: res.persona_label || 'Business',
      value_sentiment_cell: {
        value_tier: res.value_tier || 'Standard',
        sentiment: res.sentiment_state || 'Neutral',
      },
      extracted_preferences: {
        room_type: 'Deluxe',
        noise_tolerance: 'standard',
        explicit_requests: [params.transcript],
      },
      ui_actions: [
        {
          component: 'service_recovery_panel',
          action: res.sentiment_state === 'At-Risk' ? 'trigger' : 'none',
          payload: { suggested_perk: 'Complimentary Late Check-out' },
        },
      ],
      reasoning: res.reasoning || 'Checked in successfully.',
    },
    latencyMs: Date.now() - startTime,
  };
}

export async function callMaintenanceCv(params: {
  image_data?: string;
  room_id?: string | null;
  fixture_hint?: string;
  override_confidence?: number;
}): Promise<ApiResponse<MaintenanceCvResult>> {
  const startTime = Date.now();
  const res = await apiPost<any>('/api/maintenance/diagnostics/image-triage', {
    room_id: 4,
    description: params.fixture_hint || 'Maintenance inspection image triage',
  });
  return {
    result: {
      event_type: 'MAINTENANCE_CV_RESULT',
      room_id: params.room_id || 'Suite 502',
      confidence_score: res.confidence_score || 0.95,
      requires_human_review: res.requires_human_review || false,
      identified_asset: {
        asset_type: res.identified_asset || 'Plumbing',
        likely_model: 'Standard Fitting',
      },
      visible_issue: res.visible_issue || 'Leak detected',
      severity: res.priority === 'safety' ? 'safety' : 'guest-facing',
      ui_actions: [
        {
          component: 'room_lockout',
          action: res.priority === 'safety' ? 'lock' : 'none',
          payload: { room_id: params.room_id || 'Suite 502', reason: res.reasoning },
        },
      ],
      reasoning: res.reasoning || 'Image triage complete.',
    },
    latencyMs: Date.now() - startTime,
  };
}

export async function callCostIncident(params: {
  source_work_order_id: string | null;
  anomaly_data: any;
  affects_room_ids: string[];
}): Promise<ApiResponse<CostIncidentSummary>> {
  const startTime = Date.now();
  const res = await apiGet<any>('/api/revenue/net-revpar');
  return {
    result: {
      event_type: 'COST_INCIDENT_SUMMARY',
      source_work_order_id: params.source_work_order_id || 'WO-1001',
      estimated_cost_impact: res.cost_deduction || 500,
      affects_room_ids: params.affects_room_ids,
      ui_actions: [
        {
          component: 'net_revpar_ticker',
          action: 'recalculate',
          payload: { cost_delta: -(res.cost_deduction || 500), reasoning: res.reasoning },
        },
      ],
      reasoning: res.reasoning || 'Net RevPAR recalculated.',
    },
    latencyMs: Date.now() - startTime,
  };
}

export async function callFlashSale(params: {
  asset: string;
  expires_in_minutes: number;
  checked_in_guests: Array<{ id: string; persona?: string; name: string }>;
  discounted_price?: number;
}): Promise<ApiResponse<FlashSaleOffer>> {
  const startTime = Date.now();
  const res = await apiPost<any>('/api/revenue/flash-sale', {
    asset_description: params.asset,
    expiry_minutes: params.expires_in_minutes || 60,
    price: params.discounted_price || 79,
    offer_type: 'flash_sale',
  });
  const copy = (res.guests_targeted && res.guests_targeted[0]?.offer_copy) || 'Special limited time offer.';
  return {
    result: {
      event_type: 'FLASH_SALE_OFFER',
      asset: params.asset,
      expires_in_minutes: params.expires_in_minutes || 60,
      target_guest_ids: params.checked_in_guests.map((g) => g.id),
      persona_framing: {
        Frugal: copy,
        Luxury: copy,
        Business: copy,
        Family: copy,
      },
      ui_actions: [
        {
          component: 'flash_sale_banner',
          action: 'display',
          payload: { asset: params.asset, price: params.discounted_price || 79 },
        },
      ],
      reasoning: res.reasoning || 'Flash sale created.',
    },
    latencyMs: Date.now() - startTime,
  };
}

export async function callHousekeepingReorder(params: {
  trigger_reason: string;
  current_queue: Array<{ room_id: string; current_rank: number; status: string }>;
}): Promise<ApiResponse<HousekeepingReorder>> {
  const startTime = Date.now();
  const tasks = await apiGet<any[]>('/api/housekeeping/tasks');
  return {
    result: {
      event_type: 'HOUSEKEEPING_REORDER',
      trigger_reason: params.trigger_reason,
      reordered_queue: tasks.map((t, idx) => ({
        room_id: String(t.room_id),
        new_priority_rank: idx + 1,
        reason: params.trigger_reason,
      })),
      ui_actions: [
        {
          component: 'housekeeping_queue',
          action: 'reorder',
          payload: { count: tasks.length },
        },
      ],
      reasoning: 'Queue updated from backend.',
    },
    latencyMs: Date.now() - startTime,
  };
}

export async function checkServerHealth(): Promise<{
  status: string;
  hasApiKey: boolean;
  system: string;
}> {
  try {
    const res = await apiGet<any>('/health');
    return { status: res.status || 'ok', hasApiKey: true, system: res.service || 'Smart Resort 360' };
  } catch {
    return { status: 'offline', hasApiKey: false, system: 'Smart Resort 360' };
  }
}

