"""Pydantic schemas for all service request/response contracts."""
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel


# ─── Common ──────────────────────────────────────────────────────────────────
class ReasoningMixin(BaseModel):
    reasoning: str = ""


# ─── Guest / Front Desk ───────────────────────────────────────────────────────
class CheckInRequest(BaseModel):
    name: str
    reservation_id: str
    room_id: int
    transcript: str = ""            # Voice/text intake
    checkout_date: Optional[str] = None


class GuestResponse(BaseModel):
    id: int
    name: str
    reservation_id: str
    persona_label: str
    value_tier: str
    sentiment_state: str
    checkin_date: Optional[datetime]
    checkout_date: Optional[datetime]
    wallet_spend_to_date: float
    room_id: Optional[int]
    reasoning: str = ""

    class Config:
        from_attributes = True


class ServiceRecoveryRequest(BaseModel):
    guest_id: int
    action: str = "complimentary_upgrade"
    note: str = ""


class ServiceRecoveryResponse(BaseModel):
    guest_id: int
    action_taken: str
    reasoning: str


class PriorityQueueItem(BaseModel):
    guest_id: int
    name: str
    room_id: Optional[int]
    persona_label: str
    value_tier: str
    sentiment_state: str
    priority_score: float
    reasoning: str


# ─── Room ─────────────────────────────────────────────────────────────────────
class RoomResponse(BaseModel):
    id: int
    room_number: str
    category: str
    base_rate: float
    current_rate: float
    status: str
    fault_free: bool
    floor: int
    wing: str

    class Config:
        from_attributes = True


# ─── Housekeeping ─────────────────────────────────────────────────────────────
class HousekeepingTaskResponse(BaseModel):
    id: int
    room_id: int
    status: str
    priority_rank: int
    assigned_housekeeper_id: Optional[int]
    eta_minutes: int
    blocked: str

    class Config:
        from_attributes = True


class ReorderRequest(BaseModel):
    task_ids_in_order: List[int]    # Ordered list of task IDs (first = highest priority)


class CompleteTaskRequest(BaseModel):
    task_id: int


# ─── Maintenance ──────────────────────────────────────────────────────────────
class MaintenanceTicketRequest(BaseModel):
    room_id: int
    description: str
    source: str = "staff"           # guest / staff / system
    image_base64: Optional[str] = None  # Optional base64-encoded image


class WorkOrderResponse(BaseModel):
    id: int
    room_id: Optional[int]
    asset_id: Optional[int]
    source: str
    description: str
    priority: str
    status: str
    assigned_technician_id: Optional[int]
    repair_brief: Optional[str]
    estimated_cost_impact: float
    requires_human_review: str
    required_part: Optional[str]
    part_in_stock: Optional[str]
    reasoning: str = ""

    class Config:
        from_attributes = True


class ResolveWorkOrderRequest(BaseModel):
    work_order_id: int
    resolution_notes: str = ""


class ImageTriageRequest(BaseModel):
    room_id: int
    description: str = ""
    image_base64: Optional[str] = None
    source: str = "staff"


class ImageTriageResponse(BaseModel):
    work_order_id: int
    identified_asset: str
    identified_asset_type: str
    visible_issue: str
    confidence_score: float
    requires_human_review: bool
    required_part: Optional[str]
    part_in_stock: Optional[bool]
    priority: str
    reasoning: str


class AnomalyScanResponse(BaseModel):
    flagged_rooms: List[dict]
    total_estimated_cost_impact: float
    scan_timestamp: datetime
    reasoning: str


# ─── Revenue ──────────────────────────────────────────────────────────────────
class PricingRequest(BaseModel):
    room_category: str
    occupancy_pct: float            # 0.0 – 1.0
    demand_signal: str = "neutral"  # low / neutral / high / surge
    manual_reason: Optional[str] = None


class PricingResponse(BaseModel):
    room_category: str
    old_rate: float
    new_rate: float
    change_pct: float
    trigger_reason: str
    reasoning: str


class CurrentPricingResponse(BaseModel):
    room_category: str
    current_rate: float
    base_rate: float
    last_5_changes: List[dict]


class NetRevParResponse(BaseModel):
    gross_revpar: float
    gross_adr: float
    net_revpar: float
    net_adr: float
    occupancy_pct: float
    total_active_cost_incidents: float
    cost_deduction: float
    reasoning: str


class FlashSaleRequest(BaseModel):
    asset_description: str          # e.g. "2 PM spa slot for 90 minutes"
    expiry_minutes: int = 120
    price: float = 59.0
    offer_type: str = "flash_sale"


class FlashSaleResponse(BaseModel):
    offers_created: int
    guests_targeted: List[dict]
    reasoning: str


class WingShutdownRequest(BaseModel):
    wing_id: str                    # e.g. "B"


class WingShutdownResponse(BaseModel):
    wing_id: str
    feasible: bool
    safety_blockers: List[str]
    rooms_affected: int
    rooms_remaining: int
    current_net_profit_target: float
    revised_rate_required: float
    before_after_comparison: dict
    reasoning: str
