/**
 * Smart Resort 360 - Intelligence Engine Schemas
 * Strictly adhering to system schemas & persona matrix.
 */

export type PersonaLabel =
  | 'Frugal'
  | 'Luxury'
  | 'Business'
  | 'Family'
  | 'Loyalist'
  | 'Demanding'
  | 'Influencer'
  | 'Quiet';

export type ValueTier = 'Standard' | 'VIP';
export type Sentiment = 'Positive' | 'Neutral' | 'At-Risk';
export type Severity = 'safety' | 'guest-facing' | 'cosmetic' | 'deferred';

export interface UiAction {
  component: string;
  action: string;
  payload: Record<string, any>;
}

// 1. GUEST_INTAKE_RESULT
export interface GuestIntakeResult {
  event_type: 'GUEST_INTAKE_RESULT';
  guest_id: string | null;
  persona_label: PersonaLabel;
  value_sentiment_cell: {
    value_tier: ValueTier;
    sentiment: Sentiment;
  };
  extracted_preferences: {
    room_type: string | null;
    noise_tolerance: 'quiet' | 'standard' | null;
    explicit_requests: string[];
  };
  ui_actions: UiAction[];
  reasoning: string;
}

// 2. MAINTENANCE_CV_RESULT
export interface MaintenanceCvResult {
  event_type: 'MAINTENANCE_CV_RESULT';
  room_id: string | null;
  confidence_score: number;
  requires_human_review: boolean;
  identified_asset: {
    asset_type: string | null;
    likely_model: string | null;
  };
  visible_issue: string;
  severity: Severity;
  ui_actions: UiAction[];
  reasoning: string;
}

// 3. COST_INCIDENT_SUMMARY
export interface CostIncidentSummary {
  event_type: 'COST_INCIDENT_SUMMARY';
  source_work_order_id: string | null;
  estimated_cost_impact: number;
  affects_room_ids: string[];
  ui_actions: UiAction[];
  reasoning: string;
}

// 4. FLASH_SALE_OFFER
export interface FlashSaleOffer {
  event_type: 'FLASH_SALE_OFFER';
  asset: string;
  expires_in_minutes: number;
  target_guest_ids: string[];
  persona_framing: {
    Frugal: string;
    Luxury: string;
    Business: string;
    Family: string;
  };
  ui_actions: UiAction[];
  reasoning: string;
}

// 5. HOUSEKEEPING_REORDER
export interface HousekeepingReorder {
  event_type: 'HOUSEKEEPING_REORDER';
  trigger_reason: string;
  reordered_queue: Array<{
    room_id: string;
    new_priority_rank: number;
    reason: string;
  }>;
  ui_actions: UiAction[];
  reasoning: string;
}

export type IntelligenceEngineEvent =
  | GuestIntakeResult
  | MaintenanceCvResult
  | CostIncidentSummary
  | FlashSaleOffer
  | HousekeepingReorder;

// Frontend State Models for the 4 Backend Agent Services
export interface GuestRecord {
  id: string;
  name: string;
  roomNumber?: string;
  vipTier: ValueTier;
  persona?: PersonaLabel;
  sentiment?: Sentiment;
  sentimentColor?: 'green' | 'yellow' | 'red';
  checkInStatus: 'Checked-In' | 'Arriving' | 'Checked-Out';
  arrivalEta?: string;
  preferences?: string[];
  serviceRecoveryTriggered?: boolean;
  recoveryPerk?: string;
  spendProfile?: string;
}

export interface WorkOrderRecord {
  id: string;
  room_id: string;
  asset_type: string;
  visible_issue: string;
  required_part: string | null;
  priority: 'Emergency' | 'High' | 'Standard' | 'Low';
  severity: Severity;
  status: 'Open' | 'Dispatched' | 'In Progress' | 'Resolved';
  confidence_score: number;
  requires_human_review: boolean;
  estimated_cost?: number;
  timestamp: string;
}

export interface HousekeepingTask {
  room_id: string;
  priority_rank: number;
  status: 'Cleaned' | 'In-Progress' | 'Priority-Expedite' | 'Locked-Out';
  eta_minutes: number;
  assignedStaff: string;
  reason: string;
  fault_free: boolean;
}

export interface RevenueMetric {
  baseRevPAR: number;
  currentNetRevPAR: number;
  totalCostIncidentsDelta: number;
  activeFlashSalesCount: number;
  projectedRecoveredYield: number;
}
